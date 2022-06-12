const INIT_ZOOM_LEVEL = 18;
const SCAN_MIN_LEVEL = 14;
const NORMAL_MARKER_IMAGE_URL = "http://119.207.128.97/api/upload/image?marker=marker.png";
const SELECTED_MARKER_IMAGE_URL = "http://119.207.128.97/api/upload/image?marker=marker_selected.png";

const MapApi = require("../mapApi");

module.exports = class NaverMapApi extends MapApi {
  places = new Map();
  map = null;
  normalIcon = null;
  selectedIcon = null;
  selectedMarker = null; // 클릭한 마커를 담을 변수
  infoWindow = null;

  /**
   * @override
   */
  mount() {
    const script = document.createElement("script");
    /* global naver */
    script.onload = () => this._initMap();
    script.src = `${process.env.VUE_APP_NAVER_MAP_URL}?ncpClientId=${process.env.VUE_APP_NAVER_CLIENT_ID}`;
    document.head.appendChild(script);
    return this;
  }

  _initMap = () => {
    const container = document.getElementById("mapview");
    const options = {
      center: new naver.maps.LatLng(37.2579324408187, 127.059981890576),
      zoom: INIT_ZOOM_LEVEL,
    };
    this.map = new naver.maps.Map(container, options);

    this.normalIcon = {
      content: `<img src="${NORMAL_MARKER_IMAGE_URL}" width="30" height="35"/>`,
    };
    this.selectedIcon = {
      content: `<img src="${SELECTED_MARKER_IMAGE_URL}" width="40" height="45" />`,
    };

    // infoWindow 는 오직 1개만 존재해야 되므로 this에 등록
    this.infoWindow = new naver.maps.InfoWindow({
      borderColor: "#AFB42B",
      borderWidth: 4,
      anchorSkew: true,
    });

    naver.maps.Event.addListener(this.map, "drag", this.cbScanMap);
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

    const marker = new naver.maps.Marker({
      map: this.map,
      position: new naver.maps.LatLng(place.y, place.x),
    });
    marker.setIcon(this.normalIcon);

    naver.maps.Event.addListener(marker, "click", () => {
      if (!this.selectedMarker || this.selectedMarker !== marker) {
        !!this.selectedMarker && this.selectedMarker.setIcon(this.normalIcon);
        !!this.infoWindow.getMap() && this.infoWindow.close();

        marker.setIcon(this.selectedIcon);

        this.infoWindow.setContent(this._getContent(place));
        this.infoWindow.open(this.map, marker);

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
    return { lat: latlng.y, lng: latlng.x };
  }

  /**
   * @override
   */
  PinPlace(place) {
    this.addMarker(place);
    const placeCached = this.places.get(place.id);
    this.map.panTo(new naver.maps.LatLng(placeCached.y, placeCached.x));
    naver.maps.Event.trigger(placeCached.marker, "click");
  }

  /**
   * @override
   */
  zoomIn = () => {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  /**
   * @override
   */
  zoomOut = () => {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  /**
   * @override
   */
  isScanMinLevel() {
    const lvl = this.map.getZoom();
    return lvl >= SCAN_MIN_LEVEL ? true : false;
  }

  _getContent(place) {
    const closeOverlay = () => {
      this.infoWindow.close();
      if (this.selectedMarker) {
        this.selectedMarker.setIcon(this.normalIcon);
        this.selectedMarker = null;
      }
    };
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
      `  </div>` +
      `</div>`;
    content.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.className === this.iwCancelIcon) {
        closeOverlay();
      }
    });

    return content;
  }
};
