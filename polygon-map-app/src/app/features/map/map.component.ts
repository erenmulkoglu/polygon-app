import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import { Style, Fill, Stroke } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import Modify from 'ol/interaction/Modify';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { getArea } from 'ol/sphere';
import Translate from 'ol/interaction/Translate';
import { Collection, Overlay } from 'ol';
import { getDistance } from 'ol/sphere';
import XYZ from 'ol/source/XYZ';
import * as turf from '@turf/turf';
import { GeoJSON } from 'ol/format';
import booleanIntersects from '@turf/boolean-intersects';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule, RouterModule, NgMultiSelectDropDownModule,],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [ApiService]
})
export class MapComponent implements AfterViewInit {
  private map!: Map;
  private vectorSource!: VectorSource;
  private vectorLayer!: VectorLayer;
  private draw!: Draw;
  private modify!: Modify;

  private measureTooltipElement!: HTMLElement;
  private measureTooltip!: any;
  private sketch: Feature | null = null;
  isMeasuring: boolean = false;

 //  Katmanlar tanımlanıyor
 private osmLayer!: TileLayer;
 private satelliteLayer!: TileLayer;
 private terrainLayer!: TileLayer;

 isLayerMenuOpen: boolean = false;
 currentDay: string = '';
 currentDate: string = '';


  isDrawing: boolean = false;
  drawMode: boolean = false;
  editMode: boolean = false;
  polygons: any[] = [];
  totalArea: number = 0;
  totalPolygons: number = 0;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.map) {
      this.initMap();
    }

    // API'den poligonları yüklemeden önce map hazır olmalı
    setTimeout(() => {
      this.loadPolygons();
      this.loadMapNames();
      this.setCurrentDate();
      this.setUserLocation();
      this.initContextMenu();
    }, 0);
  }

  ngAfterViewInit(): void {
    (window as any).editFeature = this.editFeature.bind(this);
    (window as any).deleteFeature = this.deleteFeature.bind(this);
  }


  //  State için değişkenler
isSidebarOpen: boolean = false;

  //  Sidebar Aç/Kapa İşlevi
toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

private selectedFeature: Feature | null = null;

//  Sağ tık menüsünü başlat
private contextMenuElement!: HTMLElement;

initContextMenu() {
  this.contextMenuElement = document.getElementById('context-menu') as HTMLElement;

  this.map.getViewport().addEventListener('contextmenu', (event) => {
    event.preventDefault();

    const pixel = this.map.getEventPixel(event);
    const feature = this.map.forEachFeatureAtPixel(pixel, (feature) => feature);

    if (feature) {
      this.selectedFeature = feature as Feature;

      const menuWidth = 150;
      const menuHeight = 100;
      const x = Math.min(event.pageX, window.innerWidth - menuWidth);
      const y = Math.min(event.pageY, window.innerHeight - menuHeight);

      this.contextMenuElement.style.left = `${x}px`;
      this.contextMenuElement.style.top = `${y}px`;
      this.contextMenuElement.style.display = 'block';

    } else {
      this.contextMenuElement.style.display = 'none';
    }
  });

  //  Kenar düzeltme ve silme butonlarına doğrudan bağlan
  document.getElementById('edit-feature')?.addEventListener('click', () => this.editFeature());
  document.getElementById('delete-feature')?.addEventListener('click', () => this.deleteFeature());

  // Menü dışına tıklandığında menüyü kapat
  document.addEventListener('click', (event) => {
    if (!this.contextMenuElement.contains(event.target as Node)) {
      this.contextMenuElement.style.display = 'none';
    }
  });
}
editFeature() {
  if (this.selectedFeature) {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }

    if (this.modify) {
      this.map.removeInteraction(this.modify);
    }

    const selectedFeatures = new Collection([this.selectedFeature]);

    this.modify = new Modify({
      features: selectedFeatures
    });

    this.modify.on('modifyend', (event) => {
      console.log("Kenar düzeltme tamamlandı");
      const updatedPolygons = event.features.getArray().map(f => {
        const geometry = f.getGeometry() as Polygon;
        const area = getArea(geometry);
        const coordinates = geometry.getCoordinates();
        const polygonId = String(f.getId());

        if (!polygonId) return null;

        return {
          _id: polygonId,
          area,
          coordinates,
          color: this.getColorByArea(area)
        };
      }).filter(p => p !== null);

      if (updatedPolygons.length) {
        this.updatePolygons(updatedPolygons);
      }
    });

    this.map.addInteraction(this.modify);
  }
}


deleteFeature() {
  if (this.selectedFeature) {
    this.vectorSource.removeFeature(this.selectedFeature);
    this.selectedFeature = null;
    console.log("Poligon silindi");
  }}

  //  Kullanıcının konumuna zoom yap
  setUserLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.map.setView(new View({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 10,
          projection: 'EPSG:3857',
        }));
      },
      (error) => console.error('Konum alınamadı:', error)
    );
  }

  private featuresCollection!: Collection<Feature>;

  private translate!: Translate;

  initTranslate() {
    if (this.translate) this.map.removeInteraction(this.translate);
  
    this.translate = new Translate({
      features: this.featuresCollection //  Null hatası çözülüyor
    });
  
    this.translate.on('translateend', (event) => {
      const feature = event.features.getArray()[0];
      const geometry = feature.getGeometry() as Polygon;
      const coordinates = geometry.getCoordinates();
      const area = getArea(geometry);
      const polygonId = feature.getId();
  
      console.log('Poligon taşındı:', coordinates);
  
      if (polygonId) {
        const updatedPolygon = {
          _id: String(polygonId),
          area,
          coordinates,
          color: this.getColorByArea(area)
        };
  
        this.updatePolygons([updatedPolygon]); // API ile güncelle
      }
    });
  
    this.map.addInteraction(this.translate);
  }  

dragMode: boolean = false;

toggleTranslateMode() {
  if (this.dragMode) {
    this.map.removeInteraction(this.translate);
    this.dragMode = false;
    console.log('Sürükleme devre dışı bırakıldı.');
  } else {
    this.initTranslate();
    this.dragMode = true;
    console.log('Sürükleme aktif hale getirildi.');
  }
}

  // Harita Başlat
  initMap() {    

    // Harita Görünümü (OSM)
this.osmLayer = new TileLayer({
  source: new OSM(),
  visible: true // Başlangıçta aktif olan katman
});

// Uydu Görünümü (Google)
this.satelliteLayer = new TileLayer({
  source: new XYZ({
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  }),
  visible: false
});

// Arazi Görünümü (Google)
this.terrainLayer = new TileLayer({
  source: new XYZ({
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  }),
  visible: false
});

    if (this.map) {
      console.warn('Harita zaten başlatıldı.');
      return;
    }    
  // Features koleksiyonunu manuel olarak oluştur
  this.featuresCollection = new Collection();

  this.vectorSource = new VectorSource({
    features: this.featuresCollection //  Buraya manuel olarak koleksiyon ekliyoruz
  }); 
  
    this.vectorLayer = new VectorLayer({ source: this.vectorSource });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        this.osmLayer,
        this.satelliteLayer,
        this.terrainLayer,
        this.vectorLayer
            ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: 'EPSG:3857',

      }),
      controls: [] //  Varsayılan kontrolleri kaldırır

    });

    //  Çift tıklamada zoom yapmasını engelle
    this.map.getViewport().addEventListener('dblclick', (event) => {
      event.preventDefault(); // Varsayılan zoom olayını kapatıyoruz
    });
  }

  setLayer(layerType: string) {
    this.osmLayer.setVisible(layerType === 'osm');
    this.satelliteLayer.setVisible(layerType === 'satellite');
    this.terrainLayer.setVisible(layerType === 'terrain');
  }
  
  setCurrentDate() {
    const days = [
      'Pazar', 'Pazartesi', 'Salı', 'Çarşamba',
      'Perşembe', 'Cuma', 'Cumartesi'
    ];

    const today = new Date();
    this.currentDay = days[today.getDay()];
    this.currentDate = `${today.getDate()} ${this.getMonthName(today.getMonth())}`;
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[monthIndex];
  }

  //  Menü Aç/Kapa
  toggleLayerMenu() {
    this.isLayerMenuOpen = !this.isLayerMenuOpen;
  }
  
//  Meta Verisi için yapı oluşturuyoruz
polygonMeta = {
  name: '',
  city: '',
  district: ''
};

isDrawingComplete = false;
currentFeature: Feature | null = null;
isPolygonInfoVisible: boolean = false;

togglePolygonInfo() {
  this.isPolygonInfoVisible = !this.isPolygonInfoVisible;
}  
  //  Çizim Başlat
initDrawing() {
  if (this.draw) this.map.removeInteraction(this.draw);

  this.draw = new Draw({
    source: this.vectorSource,
    type: 'Polygon'
  });

  this.draw.on('drawstart', () => {
    this.isDrawing = true;
  });

  this.draw.on('drawend', (event) => {
    this.isDrawing = false;
    const feature = event.feature;
    const geometry = feature.getGeometry() as Polygon;
  
    if (geometry) {
      const area = getArea(geometry);
      const areaInDekar = area / 1000;
  
      console.log('Poligon Çizildi, meta verisi bekleniyor...');
  
      // Geometriyi geçici olarak tutuyoruz ama kaydetmiyoruz
      this.currentFeature = feature;
      this.isDrawingComplete = true; //  Çizim tamamlandı => Butonları aç
      feature.setStyle(this.getPolygonStyle(areaInDekar));
      this.vectorSource.addFeature(feature);
    }
  });  

  this.map.addInteraction(this.draw);
}

  // Düzenleme Başlat (Çift Tıklama ile Aktif)
  initModify() {
    if (this.modify) this.map.removeInteraction(this.modify);

    this.modify = new Modify({
      source: this.vectorSource,
      condition: () => true //  Anında düzenleme için aktif hale getiriyoruz
    });

    this.modify.on('modifyend', (event) => {
      const updatedPolygons = event.features.getArray().map(f => {
        const geometry = f.getGeometry() as Polygon;
        const area = geometry.getArea();
        const coordinates = geometry.getCoordinates();
        const polygonId = String(f.getId());

        if (!polygonId) return null;

        return {
          _id: polygonId,
          area,
          coordinates,
          color: this.getColorByArea(area)
        };
      }).filter(p => p !== null);

      if (updatedPolygons.length) {
        this.updatePolygons(updatedPolygons);
      }
          });

    this.map.addInteraction(this.modify);
  }

  zoomIn(): void {
    this.map?.getView()?.setZoom(this.map.getView()?.getZoom()! + 1);
  }
  
  zoomOut(): void {
    this.map?.getView()?.setZoom(this.map.getView()?.getZoom()! - 1);
  }
  
  showMetaForm = false;

  //  Poligon İstatistikleri Yapısı
polygonStats = {
  perimeter: 0,
  center: [0, 0],
  area: 0
};

showStats: boolean = false; // Detayları göster/gizle

//  Poligon İstatistiklerini Hesapla
getPolygonStats(polygon: any) {
  const feature = this.vectorSource.getFeatures().find(f => 
    String(f.getId()) === String(polygon._id)
  );

  if (feature) {
    const geometry = feature.getGeometry() as Polygon;
    const coordinates = geometry.getCoordinates();
    
    //  Çevre uzunluğu hesapla
    const perimeter = coordinates[0].reduce((total, current, index, arr) => {
      if (index < arr.length - 1) {
        const next = arr[index + 1];
        const dx = next[0] - current[0];
        const dy = next[1] - current[1];
        return total + Math.sqrt(dx * dx + dy * dy);
      }
      return total;
    }, 0);

    //  Merkez koordinatları hesapla
    const center = geometry.getInteriorPoint().getCoordinates();

    this.polygonStats = {
      perimeter: perimeter,
      center: center,
      area: polygon.area
    };

    console.log(`Çevre: ${perimeter.toFixed(2)} metre`);
    console.log(`Merkez: [${center[0].toFixed(6)}, ${center[1].toFixed(6)}]`);
    console.log(`Alan: ${polygon.area.toFixed(2)} m²`);

    this.showStats = true; // Detayları aç
  }
}

// Mesafe ölçümünü başlatan fonksiyon
startMeasure() {
  if (this.draw) this.map.removeInteraction(this.draw);

  this.isMeasuring = true;

  this.draw = new Draw({
    source: this.vectorSource,
    type: 'LineString'
  });

  this.draw.on('drawstart', (event) => {
    this.sketch = event.feature;
    this.createMeasureTooltip();
  });

  this.draw.on('drawend', (event) => {
    this.sketch = null;
    this.measureTooltipElement.className = 'tooltip tooltip-static';
    this.map.removeInteraction(this.draw);
    this.isMeasuring = false;
  });

  this.map.addInteraction(this.draw);

  this.draw.on('drawstart', (event) => {
    let geom = event.feature.getGeometry() as LineString;

    geom.on('change', () => {
      const coordinates = geom.getCoordinates();
      const length = getDistance(coordinates[0], coordinates[1]);
      this.updateMeasureTooltip(length);
    });
  });
}

// Mesafe ölçüm göstergesini oluşturur
createMeasureTooltip() {
  if (this.measureTooltipElement) {
    this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement);
  }

  this.measureTooltipElement = document.createElement('div');
  this.measureTooltipElement.className = 'tooltip tooltip-measure';
  this.measureTooltip = new Overlay({
    element: this.measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });

  this.map.addOverlay(this.measureTooltip);
}

// Mesafe göstergesini günceller
updateMeasureTooltip(length: number) {
  if (!this.measureTooltipElement) return;

  this.measureTooltipElement.innerHTML = length.toFixed(2) + ' km';

  if (this.sketch) {
    const geometry = this.sketch.getGeometry() as LineString;
    const lastCoordinate = geometry.getLastCoordinate();

    this.measureTooltip.setPosition(lastCoordinate);
  }
}

//Mesafe sıfırlama/resetleme: Çizimi de kaldırır.
resetMeasure() {
  // Çizimi kaldır (Sadece ölçüm çizgisi kaldırılıyor)
  if (this.sketch) {
    this.vectorSource.removeFeature(this.sketch);
    this.sketch = null;
  }

  // Ölçüm çizgilerini kaldır (Kalan çizimleri temizliyoruz)
  const features = this.vectorSource.getFeatures();
  features.forEach((feature) => {
    if (feature.getGeometry()?.getType() === 'LineString') {
      this.vectorSource.removeFeature(feature);
    }
  });

  // Mesafe yazısını kaldır
  if (this.measureTooltip) {
    this.map.removeOverlay(this.measureTooltip);
    this.measureTooltip = null;
  }
}

cancelDrawing() {
  if (this.currentFeature) {
    this.vectorSource.removeFeature(this.currentFeature);
    this.currentFeature = null;
  }

  this.isDrawingComplete = false; // Butonları gizle
  this.showMetaForm = false;
  console.log('Çizim iptal edildi.');
}


// Detayları Aç/Kapat
toggleStats() {
  this.showStats = !this.showStats;
}

checkIntersection() {
  const features = this.vectorSource.getFeatures();
  const format = new GeoJSON();

  for (let i = 0; i < features.length; i++) {
    const featureA = format.writeFeatureObject(features[i]);

    // geometry ve coordinates kontrolü
    if (
      !featureA.geometry ||
      featureA.geometry.type !== 'Polygon' ||
      !featureA.geometry.coordinates
    ) continue;

    for (let j = i + 1; j < features.length; j++) {
      const featureB = format.writeFeatureObject(features[j]);

      if (
        !featureB.geometry ||
        featureB.geometry.type !== 'Polygon' ||
        !featureB.geometry.coordinates
      ) continue;

      const polyA = turf.polygon(featureA.geometry.coordinates);
      const polyB = turf.polygon(featureB.geometry.coordinates);

      const isIntersecting = booleanIntersects(polyA, polyB);


      if (isIntersecting) {
        console.log(' Kesişen poligonlar bulundu:', i, j);

        features[i].setStyle(
          new Style({
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'red', width: 2 }),
          })
        );

        features[j].setStyle(
          new Style({
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'red', width: 2 }),
          })
        );
      }
    }
  }
}
  
  savePolygonMeta() {
    if (!this.currentFeature) {
      console.error('Feature bulunamadı!');
      return;
    }
  
    const geometry = this.currentFeature.getGeometry() as Polygon;
    if (!geometry) {
      console.error('Geometry bulunamadı!');
      return;
    }
  
    const coordinates = geometry.getCoordinates();
    const area = getArea(geometry);
    const areaInDekar = area / 1000;
  
    //  Boş olan alanlar için uyarı
    if (!this.polygonMeta.name || !this.polygonMeta.city || !this.polygonMeta.district) {
      alert('Lütfen tüm bilgileri doldurun.');
      return;
    }
  
    const data = {
      userId: this.authService.getUserId(), // aktif kullanıcıdan
      area: areaInDekar,
      coordinates: coordinates,
      color: this.getColorByArea(areaInDekar),
      name: this.polygonMeta.name,
      city: this.polygonMeta.city,
      district: this.polygonMeta.district
    };
      
    if (this.editingPolygonId) {
      this.removePolygonById(this.editingPolygonId);
      this.apiService.updatePolygon(this.editingPolygonId, data).subscribe(() => {
        this.addPolygonToMap(data, this.editingPolygonId);
        this.loadPolygons();
        this.resetForm();
        alert('Poligon başarıyla güncellendi.');
      });
    } 
    else {
      this.apiService.addPolygon(data).subscribe((res) => {
        const polygonId = String(res._id);
        this.addPolygonToMap(data, polygonId);
        this.loadPolygons();
        this.loadMapNames();
        this.showMetaForm = false;
        this.resetForm();
        alert('Poligon başarıyla kaydedildi.');
      
        this.isDrawingComplete = false; // Kaydettikten sonra butonları gizle

         
      //  ID ve stil ayarını yapalım
      if (this.currentFeature) {
        this.currentFeature.setId(polygonId);
        this.currentFeature.setStyle(this.getPolygonStyle(areaInDekar));
  
        //  Poligon listesine ekleyelim (UI güncellemesi)
      }
    //  UI Güncellemesi
    this.polygons.push(data);
  
        this.calculateStatistics();
        alert('Poligon başarıyla kaydedildi.');
  
        //  Formu sıfırla
        this.polygonMeta = { name: '', city: '', district: '' };
        this.isDrawingComplete = false;

      }
    )};
  }
  removePolygonById(polygonId: string) {
    if (!polygonId) return;
  
    // Listeden Kaldır
    this.polygons = this.polygons.filter(p => p._id !== polygonId);
  
    // Haritadan Kaldır
    const feature = this.vectorSource.getFeatures().find(f => 
      String(f.getId()) === String(polygonId)
    );
  
    if (feature) {
      this.vectorSource.removeFeature(feature);
    }
  }  
  addPolygonToMap(polygon: any, polygonId: any) {
    if (!polygon || !polygonId) return;
  
    const feature = new Feature({
      geometry: new Polygon(polygon.coordinates)
    });
  
    feature.setId(polygonId);
    feature.setStyle(this.getPolygonStyle(polygon.area));
    this.vectorSource.addFeature(feature);
  }  
// Formu Sıfırlama
resetForm() {
  this.polygonMeta = { name: '', city: '', district: '' };
  this.isDrawingComplete = false;
  this.editingPolygonId = null;
}
  // Çizim Modunu Aç/Kapat
  toggleDrawMode() {
    if (this.drawMode) {
      this.map.removeInteraction(this.draw);
      this.drawMode = false;
    } else {
      this.initDrawing();
      this.drawMode = true;
    }
  }
  // Düzenleme Modunu Aç/Kapat
  toggleEditMode() {
    if (this.editMode) {
      this.map.removeInteraction(this.modify);
      this.editMode = false;
      console.log('Düzenleme devre dışı bırakıldı.');
    } else {
      this.initModify();
      this.editMode = true;
      console.log('Düzenleme aktif hale getirildi.');
    }
  }
  

// Renk ve Stil Belirleme
getColorByArea(area: number): string {
  const areaInDekar = area / 1000; // Metrekareyi dekara çeviriyoruz

  if (areaInDekar < 10) return 'red'; // 10 dekardan az
  if (areaInDekar >= 10 && areaInDekar < 30) return 'blue'; // 10-30 dekar arası
  if (areaInDekar >= 30 && areaInDekar < 50) return 'yellow'; // 30-50 dekar arası
  return 'white'; // ⚪ 50 dekar üzeri
}

getPolygonStyle(areaOrColor: number | string): Style {
  const fillColor =
    typeof areaOrColor === 'string'
      ? areaOrColor
      : this.getColorByArea(areaOrColor);

  return new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: 'black', width: 2 })
  });
}

startDrawing() {

  if (this.modify) {
    this.map.removeInteraction(this.modify);
  }
  
  if (this.draw) {
    this.map.removeInteraction(this.draw);
  }

  this.draw = new Draw({
    source: this.vectorSource,
    type: 'Polygon',
  });

  this.draw.on('drawstart', () => {
    this.isDrawing = true;
    console.log('📏 Çizim Başladı...');
  });

  this.draw.on('drawend', (event) => {
    this.isDrawing = false;
    const feature = event.feature;
    const geometry = feature.getGeometry() as Polygon;

    if (geometry) {
      const area = getArea(geometry);
      const areaInDekar = area / 1000;

      console.log('Çizim Tamamlandı');

      // Geometriyi geçici olarak tutuyoruz ama kaydetmiyoruz
      this.currentFeature = feature;
      this.showMetaForm = true; // Form açılıyor
      this.isDrawingComplete = true;

      // Çizim sonrası özellikleri gösterelim
      feature.setStyle(this.getPolygonStyle(areaInDekar));
      this.vectorSource.addFeature(feature);
    }
  });

  this.map.addInteraction(this.draw);
}
  // Poligon Güncelle
  updatePolygons(updatedPolygons: any[]) {
    updatedPolygons.forEach(polygon => {
      if (polygon._id) {
        this.apiService.updatePolygon(polygon._id, polygon).subscribe(() => {
          console.log(`Poligon güncellendi: ${polygon._id}`);
          this.loadPolygons();
        });
      }
    });
  }  
  clearPolygons() {
    this.vectorSource.clear(); // Tüm feature'ları kaldır
    this.polygons = []; // Listeyi sıfırla
    this.calculateStatistics(); // İstatistikler güncellendi
  }

  deletePolygon(index: number) {
    if (index < 0 || index >= this.polygons.length) {
      console.error('Geçersiz index:', index);
      return;
    }  
    const polygon = this.polygons[index];
    if (!polygon || !polygon._id) {
      console.error('Silinecek poligon bulunamadı.');
      return;
    }  
    this.apiService.deletePolygon(polygon._id).subscribe({
      next: () => {
        console.log('Poligon silindi:', polygon._id);
  
        // Poligon listeden kaldır
        this.polygons.splice(index, 1);
  
        // ID üzerinden feature kaldırırken ID'nin string olduğundan emin ol
        const feature = this.vectorSource.getFeatures().find(f => 
          String(f.getId()) === String(polygon._id)
        );
  
        if (feature) {
          this.vectorSource.removeFeature(feature); // Feature kaldırılıyor
        }
  
        this.calculateStatistics(); // İstatistikler güncellendi
      },
      error: (err: any) => console.error('Poligon silinemedi:', err)
    });
  }    
  loadMapNames() {
    this.haritaDropdownList = this.polygons
      .map(p => p.name)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .map((name, index) => ({ item_id: index, item_text: name }));
  
    this.ilDropdownList = this.polygons
      .map(p => p.city)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .map((il, index) => ({ item_id: index, item_text: il }));
  } 


dropdownSettings = {
  singleSelection: false,
  idField: 'item_id',
  textField: 'item_text',
  selectAllText: 'Tümünü Seç',
  unSelectAllText: 'Tümünü Kaldır',
  itemsShowLimit: 2,
  allowSearchFilter: true
};

haritaDropdownList: any[] = [];
ilDropdownList: any[] = [];
ilceDropdownList: any[] = [];

selectedHaritalar: any[] = [];
selectedIller: any[] = [];
selectedIlceler: any[] = [];


onHaritalarSec() {
  const selectedNames = this.selectedHaritalar.map(x => x.item_text);
  this.selectedIller = [];
  this.selectedIlceler = [];
  this.vectorSource.clear();

  const filtered = this.polygons.filter(p => selectedNames.includes(p.name));
  this.ilDropdownList = [...new Set(filtered.map(p => p.city).filter(Boolean))]
    .map((il, i) => ({ item_id: i, item_text: il }));

  filtered.forEach(p => this.addPolygonToMap(p, p._id));
  this.checkIntersection();

}


onIllerSec() {
  const selectedMapNames = this.selectedHaritalar.map(x => x.item_text);
  const selectedCities = this.selectedIller.map(x => x.item_text);

  this.selectedIlceler = []; // İlçe sıfırlanmalı
  this.vectorSource.clear(); // Haritadaki poligonları temizle

  const filteredPolygons = this.polygons.filter(p =>
    selectedMapNames.includes(p.name) &&
    selectedCities.includes(p.city)    
    
  );

  // İlçeleri yükle
  this.ilceDropdownList = [...new Set(filteredPolygons.map(p => p.district).filter(Boolean))]
    .map((ilce, i) => ({ item_id: i, item_text: ilce }));

  // Poligonları haritada göster
  filteredPolygons.forEach(p => this.addPolygonToMap(p, p._id));
  this.checkIntersection();

}

onIlcelerSec() {
  const selectedMapNames = this.selectedHaritalar.map(x => x.item_text);
  const selectedCities = this.selectedIller.map(x => x.item_text);
  const selectedDistricts = this.selectedIlceler.map(x => x.item_text);

  this.vectorSource.clear();

  const filteredPolygons = this.polygons.filter(p =>
    selectedMapNames.includes(p.name) &&
    selectedCities.includes(p.city) &&
    selectedDistricts.includes(p.district)
  );

  filteredPolygons.forEach(p => this.addPolygonToMap(p, p._id));
  this.checkIntersection();

}

loadPolygons() {
  const userId = this.authService.getUserId();
  if (!userId) {
    console.error('Kullanıcı ID bulunamadı.');
    return;
  }

  this.apiService.getPolygons(userId).subscribe((polygons) => {
    this.vectorSource.clear();
    this.featuresCollection.clear();
    this.polygons = [];

    polygons.forEach(polygon => {
      const feature = new Feature({
        geometry: new Polygon(polygon.coordinates)
      });

      feature.setId(polygon._id);
      feature.setStyle(this.getPolygonStyle(polygon.area || 0));
      feature.setProperties({
        name: polygon.name,
        city: polygon.city,
        district: polygon.district
      });

      this.vectorSource.addFeature(feature);
      this.featuresCollection.push(feature);
      this.polygons.push(polygon);
    });

    this.loadMapNames();
    this.calculateStatistics();
    this.checkIntersection();
  });
}

  editingPolygonId: string | null = null;

  //  Poligon Düzenleme İşlemi
  editPolygon(index: number) {
    const polygon = this.polygons[index];
    if (!polygon || !polygon._id) return;
  
    this.polygonMeta = {
      name: polygon.name,
      city: polygon.city,
      district: polygon.district,
    };
  
    this.editingPolygonId = polygon._id; // Düzenlenecek poligonun ID'si
    this.isDrawingComplete = true; // Formu göster
  }
  
  toggleLayer() {
    const isVisible = this.vectorLayer.getVisible();
    this.vectorLayer.setVisible(!isVisible);
    console.log(`Katmanlar ${isVisible ? 'gizlendi' : 'gösterildi'}`);
  }  
  //  Haritayı sıfırlama fonksiyonu
resetMap() {
  this.map.setView(new View({
    center: [0, 0], // Başlangıç koordinatlarına döndür
    zoom: 2,        // Başlangıç zoom seviyesine döndür
    projection: 'EPSG:3857',
  }));
  console.log('Harita sıfırlandı.');
}
  //  İstatistikleri Güncelle
  calculateStatistics() {
    this.totalPolygons = this.polygons.length;
    this.totalArea = this.polygons.reduce((sum, polygon) => sum + polygon.area, 0);
    console.log(`Toplam Poligon: ${this.totalPolygons}, Toplam Alan: ${this.totalArea}`);
  }
}
