class Sighting {
    date;
    time;
    city;
    country;
    shape;
    duration;
    comments;
    lat;
    long;
    constructor(date, time, city, country, shape, duration, comments, lat, long) {
        this.date = date;
        this.time = time;
        this.city = city;
        this.country = country;
        this.shape = shape;
        this.duration = duration;
        this.comments = comments;
        this.lat = lat;
        this.long = long;
    }
    // Getter
    get date() {
        return this.date;
    }
    get time() {
        return this.time;
    }
    get city() {
        return this.city;
    }
    get country() {
        return this.country;
    }
    get shape() {
        return this.shape;
    }
    get duration() {
        return this.duration;
    }
    get comments() {
        return this.comments;
    }
    get lat() {
        return this.lat;
    }
    get long() {
        return this.long;
    }
}