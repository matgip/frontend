const selectedMarkerImage = require("@/assets/images/marker_selected.png");
const normalMarkerImage = require("@/assets/images/marker.png");
const imgSize = { width: 40, height: 45 };

const SCAN_MIN_LEVEL = 4;
const CLUSTER_MIN_LEVEL = 6;
const SCANNED = 1;

import agencyApi from "../agency";

class KakaoMap {
  places = new Map();
  map = null;

  selectedMarker = null; // 클릭한 마커를 담을 변수

  mount() {
    if (window.kakao && window.kakao.maps) {
      this.initMap();
    } else {
      const script = document.createElement("script");
      /* global kakao */
      script.onload = () => kakao.maps.load(this.initMap);
      script.src = `${process.env.VUE_APP_MAP_LIB_URL}?autoload=false&appkey=${process.env.VUE_APP_KAKAO_JAVASCRIPT_KEY}&libraries=services,clusterer,drawing`;
      document.head.appendChild(script);
    }

    return this;
  }

  initMap = () => {
    const container = document.getElementById("mapview");
    const options = {
      center: new kakao.maps.LatLng(37.2579324408187, 127.059981890576),
      level: SCAN_MIN_LEVEL,
    };

    this.map = new kakao.maps.Map(container, options);
    // this.roadview = new kakao.maps.Roadview(container);
    // this.roadviewClient = new kakao.maps.RoadviewClient();

    this.placeSearch = new kakao.maps.services.Places(this.map);
    this.markerCluster = new kakao.maps.MarkerClusterer({
      map: this.map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
      averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
      minLevel: CLUSTER_MIN_LEVEL, // 클러스터 할 최소 지도 레벨
    });

    // selectedCustomOverlay 는 오직 1개만 존재해야 되므로 this에 등록
    this.selectedCustomOverlay = new kakao.maps.CustomOverlay({ yAnchor: 1.5 });

    this.normalImage = new kakao.maps.MarkerImage(normalMarkerImage, new kakao.maps.Size(30, 35));
    this.selectedImage = new kakao.maps.MarkerImage(
      selectedMarkerImage,
      new kakao.maps.Size(imgSize.width, imgSize.height)
    );

    kakao.maps.event.addListener(this.map, "idle", this.scan);
    // 최초 Load시 스캔
    this.scan();
  };

  scan = async () => {
    const lvl = this.map.getLevel();
    if (lvl >= this.SCAN_MIN_LEVEL) return;

    const { lat, lng } = this._getRoundedCenter();

    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const x = (lng + j / 100).toFixed(2);
        const y = (lat + i / 100).toFixed(2);
        if (this._isScanned(y, x)) continue;
        this._cacheLatLng(y, x);
        // this.placeSearch.categorySearch("AG2", this._callback, { x: x, y: y, radius: 300 }); // redius 710 will cover all boundary
        const places = await agencyApi.searchByCenter(x, y);
        for (let p of places) {
          this.addMarker(p);
        }
      }
    }
  };

  PinPlace(place) {
    this.addMarker(place);
    const placeCached = this.places.get(place.id);
    this.map.panTo(new kakao.maps.LatLng(placeCached.y, placeCached.x));
    kakao.maps.event.trigger(placeCached.marker, "click");
  }

  getCenter() {
    const latlng = this.map.getCenter();
    return { y: latlng.getLat(), x: latlng.getLng() };
  }

  _getRoundedCenter() {
    const latlng = this.map.getCenter();
    const lat = Math.round(latlng.getLat() * 100) / 100;
    const lng = Math.round(latlng.getLng() * 100) / 100;
    return { lat: lat, lng: lng };
  }

  _isScanned(lat, lng) {
    if (this.cachedLatLng === undefined) return false;
    if (this.cachedLatLng[lat] === undefined) return false;
    return this.cachedLatLng[lat][lng] === SCANNED;
  }
  _cacheLatLng(lat, lng) {
    this.cachedLatLng ??= new Array();
    this.cachedLatLng[lat] ??= new Array();
    this.cachedLatLng[lat][lng] = SCANNED;
  }

  zoomIn = () => {
    this.map.setLevel(this.map.getLevel() - 1);
  };

  zoomOut = () => {
    this.map.setLevel(this.map.getLevel() + 1);
  };

  addMarker = (place) => {
    if (this.places.has(place.id)) {
      return;
    }
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(place.y, place.x),
      image: this.normalImage,
      clickable: true,
    });
    this.markerCluster.addMarker(marker);

    const mouseoverContent = '<div style="padding:2px;">' + place.place_name + "</div>";
    const mouseoverInfowindow = new kakao.maps.InfoWindow({ content: mouseoverContent });

    kakao.maps.event.addListener(marker, "mouseover", () => {
      if (!this.selectedMarker || this.selectedMarker !== marker) {
        mouseoverInfowindow.open(this.map, marker);
      }
    });
    kakao.maps.event.addListener(marker, "mouseout", () => {
      mouseoverInfowindow.close();
    });
    kakao.maps.event.addListener(marker, "click", () => {
      if (!this.selectedMarker || this.selectedMarker !== marker) {
        !!this.selectedMarker && this.selectedMarker.setImage(this.normalImage);
        marker.setImage(this.selectedImage);
        mouseoverInfowindow.close();
        console.log("TEST");
        this.selectedCustomOverlay.setContent(this._getOverlayContent(place));
        this.selectedCustomOverlay.setPosition(marker.getPosition());
        this.selectedCustomOverlay.setMap(this.map);

        // TODO : notify click event to store
        this.notifyAgencyClicked(place);
        this.selectedMarker = marker;
      }
    });

    place.marker = marker;
    this.places.set(place.id, place);
  };

  _getOverlayContent(place) {
    const closeOverlay = () => {
      this.selectedCustomOverlay.setMap(null);
      if (this.selectedMarker) {
        this.selectedMarker.setImage(this.normalImage);
        this.selectedMarker = null;
      }
    };
    const toggleRoadView = () => {
      console.log("TT");
    };
    const cancelIcon = "fa-solid fa-xmark fa-lg";
    const wrapCSS = `
      padding: 10px;
      
      border-radius: 10px;
      border: 2px solid #AFB42B;
      background-color: white;

    `;
    const titleContainerCSS = `
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      font-size: 16px;
      font-weight: bold;

      border-bottom: 1px solid #e0e0e0;
    `;
    const titleCSS = `
      margin-right: 10px;
    `;
    const roadContainerCSS = `
      font-size: 14px;
      margin-top: 10px;
    `;
    const roadViewButtonCSS = `
      color: blue;
      padding-top: 2px;
    `;
    const content = document.createElement("div");
    content.innerHTML =
      `<div style="${wrapCSS}">` +
      `  <div style="${titleContainerCSS}">` +
      `    <div id="title" style="${titleCSS}">` +
      `      ${place.place_name}` +
      `    </div>` +
      `    <i class="${cancelIcon}"></i>` +
      `  </div>` +
      `  <div style="${roadContainerCSS}">` +
      `    <p>${place.road_address_name}</p>` +
      `    <button class="roadview" style="${roadViewButtonCSS}">로드뷰</button>` +
      `  </div>` +
      `</div>`;
    content.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.className === cancelIcon) {
        closeOverlay();
      } else if (e.target.className === "roadview") {
        toggleRoadView();
      }
    });

    return content;
  }

  setOnClickAgencyListener(listener) {
    this.onClickAgency = listener;
  }
  notifyAgencyClicked(place) {
    this.onClickAgency(place);
  }
}

export default new KakaoMap();
