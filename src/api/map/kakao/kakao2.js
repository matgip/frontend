const selectedMarkerImage = require("@/assets/images/marker_selected.png");
const normalMarkerImage = require("@/assets/images/marker.png");
const imgSize = { width: 40, height: 45 };

const SCAN_MIN_LEVEL = 4;
const CLUSTER_MIN_LEVEL = 6;

const MapApi = require("../mapApi");

module.exports = class KakaoMapApi extends MapApi {
  places = new Map();
  map = null;
  selectedMarker = null; // 클릭한 마커를 담을 변수

  /**
   * @override
   */
  mount() {
    if (window.kakao && window.kakao.maps) {
      this._initMap();
    } else {
      const script = document.createElement("script");
      /* global kakao */
      script.onload = () => kakao.maps.load(this._initMap);
      script.src = `${process.env.VUE_APP_KAKAO_MAP_URL}?autoload=false&appkey=${process.env.VUE_APP_KAKAO_JAVASCRIPT_KEY}&libraries=services,clusterer,drawing`;
      document.head.appendChild(script);
    }

    return this;
  }

  _initMap = () => {
    const container = document.getElementById("mapview");
    const options = {
      center: new kakao.maps.LatLng(37.2579324408187, 127.059981890576),
      level: SCAN_MIN_LEVEL,
    };

    this.map = new kakao.maps.Map(container, options);

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

    kakao.maps.event.addListener(this.map, "idle", this.cbScanMap);
    // 최초 Load시 스캔
    this.cbScanMap();
  };

  /**
   * @override
   */
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

  /**
   * @override
   */
  getCenter() {
    const latlng = this.map.getCenter();
    return { lat: latlng.getLat(), lng: latlng.getLng() };
  }

  /**
   * @override
   */
  PinPlace(place) {
    this.addMarker(place);
    const placeCached = this.places.get(place.id);
    this.map.panTo(new kakao.maps.LatLng(placeCached.y, placeCached.x));
    kakao.maps.event.trigger(placeCached.marker, "click");
  }

  /**
   * @override
   */
  zoomIn = () => {
    this.map.setLevel(this.map.getLevel() - 1);
  };

  /**
   * @override
   */
  zoomOut = () => {
    this.map.setLevel(this.map.getLevel() + 1);
  };

  /**
   * @override
   */
  isScanMinLevel() {
    const lvl = this.map.getLevel();
    return lvl <= SCAN_MIN_LEVEL ? true : false;
  }

  _getOverlayContent(place) {
    const closeOverlay = () => {
      this.selectedCustomOverlay.setMap(null);
      if (this.selectedMarker) {
        this.selectedMarker.setImage(this.normalImage);
        this.selectedMarker = null;
      }
    };
    const toggleRoadView = () => {
      console.log("TODO");
    };
    const roadViewButtonCSS = `
      color: blue;
      padding-top: 2px;
    `;
    const content = document.createElement("div");
    content.innerHTML =
      `<div style="${this.iwWrapCSS}">` +
      `  <div style="${this.iwTitleContainerCSS}">` +
      `    <div id="title" style="${this.iwTitleCSS}">` +
      `      ${place.place_name}` +
      `    </div>` +
      `    <i class="${this.iwCancelIcon}"></i>` +
      `  </div>` +
      `  <div style="${this.iwAddressCSS}">` +
      `    <p>${place.road_address_name}</p>` +
      `    <button class="roadview" style="${roadViewButtonCSS}">로드뷰</button>` +
      `  </div>` +
      `</div>`;
    content.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.className === this.iwCancelIcon) {
        closeOverlay();
      } else if (e.target.className === "roadview") {
        toggleRoadView();
      }
    });

    return content;
  }
};
