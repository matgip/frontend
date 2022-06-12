const SCANNED = 1;

import agencyApi from "../agency";
import naverMapApi from "./naver/naver2";

class MapController {
  map = null;
  mapApi = null;

  constructor(corpName) {
    this.mapApi = this.createMapApi(corpName);
    this.mapApi.setOnLoadMapListener(this.scan);
  }

  /**
   * 맵을 Vue component에 마운트 합니다.
   */
  mount() {
    return this.mapApi.mount();
  }

  /**
   * 맵 중앙 (위도/경도) 값을 반환합니다.
   * @returns { lat, lng } 맵 중앙 (위도/경도) 값
   */
  getCenter() {
    return this.mapApi.getCenter();
  }

  /**
   * 반올림한 평균 (위도/경도)값을 반환합니다.
   * @param {Float} lat 위도
   * @param {Float} lng 경도
   * @returns { rLat, rLng } 반올림한 평균 (위도/경도)
   */
  getRoundedCenter(lat, lng) {
    const rLat = Math.round(lat * 100) / 100;
    const rLng = Math.round(lng * 100) / 100;
    return { rLat: rLat, rLng: rLng };
  }

  /**
   * 부동산 위치로 맵 center를 이동합니다.
   * @param {Agency} place 부동산 위치 정보
   */
  PinPlace(place) {
    this.mapApi.PinPlace(place);
  }

  /**
   * 매개변수로 들어온 (위/경도) 위치가 이미 스캔 되었는지 검사합니다.
   * @param {Float} lat 위도
   * @param {Float} lng 경도
   * @returns 이미 스캔되었다면 true, 아니라면 false 리턴
   */
  isScanned(lat, lng) {
    if (this.cachedLatLng === undefined) return false;
    if (this.cachedLatLng[lat] === undefined) return false;
    return this.cachedLatLng[lat][lng] === SCANNED;
  }

  /**
   * 매개변수로 들어온 (위/경도)를 캐싱합니다.
   * @param {Float} lat 위도
   * @param {Float} lng 경도
   */
  cacheLatLng(lat, lng) {
    this.cachedLatLng ??= new Array();
    this.cachedLatLng[lat] ??= new Array();
    this.cachedLatLng[lat][lng] = SCANNED;
  }

  scan = async () => {
    if (!this.mapApi.isScanMinLevel()) return;

    const { lat, lng } = this.mapApi.getCenter();
    const { rLat, rLng } = this.getRoundedCenter(lat, lng);

    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const x = (rLng + j / 100).toFixed(2);
        const y = (rLat + i / 100).toFixed(2);
        if (this.isScanned(y, x)) continue;
        this.cacheLatLng(y, x);

        const places = await agencyApi.searchByCenter(x, y);
        places.forEach((place) => {
          setImmediate(this.mapApi.addMarker(place));
        });
      }
    }
  };

  zoomIn = () => {
    this.mapApi.zoomIn();
  };

  zoomOut = () => {
    this.mapApi.zoomIn();
  };

  /**
   * 부동산 마커가 클릭 됬을 시, 호출될 콜백함수를 등록합니다.
   * @param {*} listener 부동산 마커가 클릭 됬을 시, 호출될 콜백함수
   */
  setOnClickAgencyListener(listener) {
    this.mapApi.setOnClickAgencyListener(listener);
  }

  /**
   * 부동산 마커가 클릭 됬을 시, 등록된 콜백함수를 실행합니다.
   * @param {*} place 부동산 마커 위치
   */
  notifyAgencyClicked(place) {
    this.mapApi.notifyAgencyClicked(place);
  }

  createMapApi(corpName) {
    switch (corpName) {
      case "naver":
        return new naverMapApi();
    }
  }
}

export default new MapController("naver");
