import geolocation from '@system.geolocation'
import brightness from '@system.brightness'
import app from '@system.app'

export default {
    data: {
        speed: "0.00",
        maxSpeed: "0.00",
        minSpeed: "0.00",
        avgSpeed: "0.00",
        totalSpeedSum: 0,
        speedReadingsCount: 0,
        distance: 0,
        distanceDisplay: "0.00",
        lastLat: 0,
        lastLon: 0,
        unit: "--- BUSCANDO GPS ---",
        currentYear: "",
        romanYear: "",
        speedColor: "#FF6200",
        altitude: "---",
        currentTime: "00:00",
        footerColor: "#00FF00",
        isMoving: false,
    },
    onInit() {
        const d = new Date();
        const y = d.getFullYear();
        this.currentYear = y.toString();
        const map = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        };
        let r = '';
        let n = y;
        for (let i in map) {
            while (n >= map[i]) {
                r += i;
                n -= map[i];
            }
        }
        this.romanYear = r;
        const coloresFuertes = [
            "#00FF00",
            "#00FFFF",
            "#FFFF00",
            "#FF00FF",
            "#FFFFFF",
            "#FF3131",
            "#FF5E00",
            "#8B00FF",
            "#00FF87",
            "#FF007F",
            "#39FF14",
            "#4D4DFF",
            "#FBFF00",
            "#FF1493",
            "#00BFFF",
            "#FFD700",
            "#ADFF2F",
            "#7DF9FF",
            "#FF4500",
            "#00FFD1"
        ];
        const indice = Math.floor(Math.random() * coloresFuertes.length);
        this.footerColor = coloresFuertes[indice];
        try {
            brightness.setKeepScreenOn({ keepScreenOn: true });
        } catch (e) {
        }
        this.startTracking();
    },
    handleSwipe(e) {
        if (e.direction === 'right') {
            app.terminate();
        }
    },
    startTracking() {
        var _this = this;
        if (this.timer) {
            clearInterval(this.timer);
        }
        _this.unit = "--- BUSCANDO GPS ---";
        _this.lastUpdateTime = new Date().getTime();
        geolocation.subscribe({
            priority: 0,
            success: function (data) {
                if (data.altitude !== undefined && data.altitude !== null && !isNaN(data.altitude)) {
                    _this.altitude = data.altitude.toFixed(0);
                }
                if (!data || data.latitude === undefined || data.longitude === undefined) {
                    return;
                }
                if (_this.unit.includes("---")) {
                    _this.unit = "Km/h";
                }
                if (_this.lastLat === 0 && _this.lastLon === 0) {
                    _this.lastLat = data.latitude;
                    _this.lastLon = data.longitude;
                    _this.lastUpdateTime = new Date().getTime();
                    return;
                }
                let v = (data.speed && data.speed > 0) ? data.speed * 3.6 : 0;
                let distActual = _this.calculateDistance(_this.lastLat, _this.lastLon, data.latitude, data.longitude);
                if (v === 0 && distActual > 0) {
                    let now = new Date().getTime();
                    let deltaT = (now - _this.lastUpdateTime) / 1000;
                    if (deltaT > 0.5 && deltaT < 10) {
                        v = (distActual / deltaT) * 3600;
                    }
                }
                if (distActual > 0.002 && distActual < 2.0) {
                    _this.distance += distActual;
                    _this.distanceDisplay = _this.distance.toFixed(2);
                    _this.speedColor = v > 120 ? "#DC143C" : "#FF6200";
                    if (v > 1.0) {
                        _this.isMoving = true;
                        _this.speed = v.toFixed(2);
                        if (v > parseFloat(_this.maxSpeed)) {
                            _this.maxSpeed = v.toFixed(2);
                        }
                        if (_this.minSpeed === "0.00" || v < parseFloat(_this.minSpeed)) {
                            _this.minSpeed = v.toFixed(2);
                        }
                        _this.totalSpeedSum += v;
                        _this.speedReadingsCount++;
                        _this.avgSpeed = (_this.totalSpeedSum / _this.speedReadingsCount).toFixed(2);
                    } else {
                        _this.isMoving = false;
                        _this.speed = "0.00";
                        _this.speedColor = "#FF6200";
                    }
                } else {
                    _this.isMoving = false;
                    _this.speed = "0.00";
                    _this.speedColor = "#FF6200";
                }
                _this.lastLat = data.latitude;
                _this.lastLon = data.longitude;
                _this.lastUpdateTime = new Date().getTime();
            },
            fail: function () {
                _this.unit = "--- SIN SEÑAL ---";
            }
        });
        this.timer = setInterval(function () {
            let now = new Date();
            let hh = now.getHours();
            let mm = now.getMinutes();
            _this.currentTime = (hh < 10 ? "0" + hh : hh) + ":" + (mm < 10 ? "0" + mm : mm);
            let ahoraMs = now.getTime();
            if (ahoraMs - _this.lastUpdateTime > 3000) {
                _this.speed = "0.00";
                _this.isMoving = false;
                _this.speedColor = "#FF6200";
            }
        }, 1000);
    },
    calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },
    onDestroy() {
        try {
            geolocation.unsubscribe();
            if (this.timer) {
                clearInterval(this.timer);
            }
            brightness.setKeepScreenOn({ keepScreenOn: false });
        } catch (e) {
        }
    }
}