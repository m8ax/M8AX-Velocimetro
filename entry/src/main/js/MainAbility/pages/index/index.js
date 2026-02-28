import geolocation from '@system.geolocation'
import brightness from '@system.brightness'
import app from '@system.app'
import sensor from '@system.sensor'
import battery from '@system.battery'

export default {
    data: {
        batteryLevel: 100,
        batteryColor: "#FFFFFF",
        frasecillas: [
            "... En Reposo ...",
            "... Velocidad Muy Lenta ...",
            "... Velocidad Lenta ...",
            "... Velocidad Moderada ...",
            "... Velocidad Alta ...",
            "... Velocidad Muy Alta ...",
            "... Velocidad De Crucero ...",
            "... Velocidad Extrema, ¿ Vuelas ? ..."
        ],
        footerText: "... En Reposo ...",
        speed: "0.00",
        totalSpeedSum: 0,
        maxSpeed: "0.00",
        minSpeed: "0.00",
        avgSpeed: "0.00",
        positionBuffer: [],
        lastUpdateTime: 0,
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
        hasGpsAltitude: false,
        currentTime: "00:00",
        footerColor: "#00FF00",
        isMoving: false,
        timer: null,
        moveConfirmationCount: 0
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
        var _this = this;
        sensor.subscribeBarometer({
            success: function (data) {
                if (_this.hasGpsAltitude) {
                    return;
                }
                let p = data.pressure;
                if (p > 2000) {
                    p = p / 100;
                }
                let a = 44330 * (1 - Math.pow(p / 1013.25, 0.1903));
                _this.altitude = a < 0 ? "0" : a.toFixed(0);
            },
            fail: function () {
                _this.altitude = "---";
            }
        });
        this.startTracking();
    },
    handleSwipe(e) {
        if (e.direction === 'right') {
            app.terminate();
        }
    },
    updateBatteryColor(level) {
        if (level > 60) {
            return "#00FF00";
        }
        if (level > 20) {
            return "#FF8800";
        }
        return "#FF0000";
    },
    startTracking() {
        var _this = this;
        let counter = 29;
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
                    _this.hasGpsAltitude = true;
                } else if (data.alt !== undefined && data.alt !== null && !isNaN(data.alt)) {
                    _this.altitude = data.alt.toFixed(0);
                    _this.hasGpsAltitude = true;
                }
                if (!data || data.latitude === undefined || data.longitude === undefined) {
                    return;
                }
                if (
                    isNaN(data.latitude) ||
                    isNaN(data.longitude) ||
                        !isFinite(data.latitude) ||
                        !isFinite(data.longitude)
                ) {
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
                let now = new Date().getTime();
                _this.positionBuffer.push({ lat: data.latitude, lon: data.longitude, time: now });
                if (_this.positionBuffer.length > 10) {
                    _this.positionBuffer.shift();
                }
                let v = 0;
                if (_this.positionBuffer.length >= 2) {
                    let first = _this.positionBuffer[0];
                    let last = _this.positionBuffer[_this.positionBuffer.length - 1];
                    let dist = _this.calculateDistance(first.lat, first.lon, last.lat, last.lon);
                    let dt = (last.time - first.time) / 1000;
                    if (dt > 0 && isFinite(dist)) {
                        v = (dist / dt) * 3600;
                    } else {
                        v = 0;
                    }
                }
                let distActual = _this.calculateDistance(_this.lastLat, _this.lastLon, data.latitude, data.longitude);
                if (v === 0 && distActual > 0.0003 && distActual < 2.0) {
                    let now = new Date().getTime();
                    let deltaT = (now - _this.lastUpdateTime) / 1000;
                    if (deltaT > 0.5 && deltaT < 10) {
                        v = (distActual / deltaT) * 3600;
                    }
                }
                let vAnterior = parseFloat(_this.speed);
                if (!isFinite(v)) {
                    v = 0;
                }
                let alpha;
                if (v < 20) {
                    alpha = 0.4;
                } else if (v < 120) {
                    alpha = 0.6;
                } else {
                    alpha = 0.85;
                }
                if (!isNaN(vAnterior) && vAnterior > 0) {
                    v = (v * alpha) + (vAnterior * (1 - alpha));
                }
                if (distActual > 0.0003 && distActual < 2.0) {
                    if (v > 0.3) {
                        _this.moveConfirmationCount++;
                    } else {
                        _this.moveConfirmationCount = 0;
                    }
                    if (_this.moveConfirmationCount >= 2) {
                        _this.distance += distActual;
                        _this.distanceDisplay = _this.distance.toFixed(2);
                    }
                    if (v > 120) {
                        _this.speedColor = "#FF0000";
                        _this.unit = "Km/h - ¡ TEN CUIDADO !";
                    } else {
                        _this.speedColor = "#FF6200";
                        if (_this.unit.includes("¡") || _this.unit.includes("---")) {
                            _this.unit = "Km/h";
                        }
                    }
                    if (v > 0.3) {
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
                        if (_this.unit.includes("¡")) {
                            _this.unit = "Km/h";
                        }
                    }
                } else {
                    _this.isMoving = false;
                    _this.speed = "0.00";
                    _this.speedColor = "#FF6200";
                    if (_this.unit.includes("¡")) {
                        _this.unit = "Km/h";
                    }
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
            counter++;
            let s = parseFloat(_this.speed);
            if (s < 0.3) {
                _this.footerText = _this.frasecillas[0];
            } else if (s < 5.0) {
                _this.footerText = _this.frasecillas[1];
            } else if (s < 10.0) {
                _this.footerText = _this.frasecillas[2];
            } else if (s < 20.0) {
                _this.footerText = _this.frasecillas[3];
            } else if (s < 60.0) {
                _this.footerText = _this.frasecillas[4];
            } else if (s < 100.0) {
                _this.footerText = _this.frasecillas[5];
            } else if (s < 200.0) {
                _this.footerText = _this.frasecillas[6];
            } else {
                _this.footerText = _this.frasecillas[7];
            }
            if (counter >= 30) {
                battery.getStatus({
                    success: function (data) {
                        let level = Math.round(data.level * 100);
                        _this.batteryLevel = level;
                        _this.batteryColor = _this.updateBatteryColor(level);
                    }
                });
                counter = 0;
            }
            let ahoraMs = now.getTime();
            if (ahoraMs - _this.lastUpdateTime > 3000) {
                _this.speed = "0.00";
                _this.isMoving = false;
                _this.speedColor = "#FF6200";
                _this.moveConfirmationCount = 0;
                _this.hasGpsAltitude = false;
                if (_this.unit.includes("¡")) {
                    _this.unit = "Km/h";
                }
            }
        }, 1000);
    },
    calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371.0088;
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
            sensor.unsubscribeBarometer();
            if (this.timer) {
                clearInterval(this.timer);
            }
            brightness.setKeepScreenOn({ keepScreenOn: false });
        } catch (e) {
        }
    }
}