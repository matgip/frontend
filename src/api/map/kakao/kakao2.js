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

    kakao.maps.event.addListener(this.map, "idle", this.scan);
    // 최초 Load시 스캔
    this.scan();
  };
};
