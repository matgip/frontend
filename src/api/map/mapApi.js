module.exports = class MapApi {
  onClickAgency = null;
  cbScanMap = null;
  /**
   * 맵을 vue 파일에 마운트 시, 호출되는 메소드입니다.
   */
  mount() {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  /**
   * Vue component에 맵을 로드할 때, 호출 될 콜백함수를 등록합니다.
   * @param {*} cbScanMap Vue component에 로드 될 때 호출 될 콜백함수
   */
  setOnLoadMapListener(cbScanMap) {
    this.cbScanMap = cbScanMap;
  }

  /**
   * 맵에 중심 위/경도를 반환합니다.
   * @returns {LatLng} 맵의 중심 위/경도
   */
  getCenter() {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  /**
   * 특정 위치로 맵의 중심을 이동합니다.
   * @param {*} place 이동할 장소
   */
  PinPlace(place) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }

  /**
   * 마커를 맵에 추가합니다.
   * @param {*} place 부동산 장소 정보
   */
  addMarker = (place) => {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  };

  /**
   * 맵을 확대 합니다.
   */
  zoomIn = () => {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  };

  /**
   * 맵을 축소 합니다.
   */
  zoomOut = () => {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  };

  /**
   * 부동산 마커가 클릭 됬을 시, 호출될 콜백함수를 등록합니다.
   * @param {*} listener 부동산 마커가 클릭 됬을 시, 호출될 콜백함수
   */
  setOnClickAgencyListener(listener) {
    this.onClickAgency = listener;
  }

  /**
   * 부동산 마커가 클릭 됬을 시, 등록된 콜백함수를 실행합니다.
   * @param {*} place 부동산 마커 위치
   */
  notifyAgencyClicked(place) {
    this.onClickAgency(place);
  }

  /**
   * 부동산을 스캔할 최소 맵 레벨을 리턴합니다.
   */
  isScanMinLevel() {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
};
