/**
 * Translates Date Object into human readable format hours, days, and years
 *
 * @return {string}         The printable date complet
 * @param {Object} info
 */
export function printEventDate(info) {
    let startD = formatDate(new Date(info.dateD));
    let startH = formatDateTime(new Date(info.dateD));
    let endD = formatDate(new Date(info.dateF));
    let endH = formatDateTime(new Date(info.dateF));
    if (info.fullday) {
        if (startD === endD) {
            return `le ${startD}`;
        }
        return `Du ${startD} au ${endD}`;
    }

    if (startD === endD) {
        return `Le ${startD} de ${startH} à ${endH}`;
    }

    return `Du ${startD} à ${startH} au ${endD} à ${endH}`;

}

/**
 * Translates Date Object into human readable format hours, days, and years
 *
 * @param  {Date} date      The Date how transform
 * @return {string}         The human readable date formatted dd/mm/YYYY
 */
export function formatDate(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return 'error';
    }
    var day = date.getDate();
    var month = (date.getMonth() + 1);
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    return day + '/' + month + '/' + date.getFullYear();
}

/**
 * Translates Date Object into human readable format hours, days, and years
 *
 * @param  {Date} date      The Date how transform
 * @return {string}         The human readable date formatted DD. d MM YYYY
 */
export function humanDate(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return 'error';
    }
    let dayN = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    let monthN = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    let day = date.getDate();
    day = day < 10 ? '0' + day : day;

    return `${dayN[date.getDay()]} ${day} ${monthN[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Translates Date Object into human readable format minutes, hours, days, and years
 *
 * @param  {Date} date      The Date how transform
 * @return {string}         The human readable date formatted HH/mm
 */
export function formatDateTime(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return 'error';
    }
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var strTime = hours + ':' + minutes;
    return strTime;
}

/**
 * Translates seconds into human readable format of seconds, minutes, hours, days, and years
 *
 * @param  {number} seconds The number of seconds to be processed
 * @return {string}         The phrase describing the the amount of time
 */
export function dateForHumans(seconds) {
    let levels = [
        [Math.floor(seconds / 31536000), 'années'],
        [Math.floor((seconds % 31536000) / 86400), 'jours'],
        [Math.floor(((seconds % 31536000) % 86400) / 3600), 'heures'],
        [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minutes'],
        [(((seconds % 31536000) % 86400) % 3600) % 60, 'secondes'],
    ];
    let returnText = '';
    for (let i = 0, max = levels.length; i < max; i++) {
        if (levels[i][0] === 0) {
            continue;
        }
        returnText += ' ' +
            levels[i][0] +
            ' ' +
            (
                levels[i][0] === 1 ?
                    levels[i][1].substr(0, levels[i][1].length - 1) :
                    levels[i][1]
            );
    }
    return returnText.trim();
}

/**
 * Generate a random number between {bottom} and {top}
 * @param bottom {int}   Start range for random generation
 * @param top {int}      End range for random generation
 * @returns {int}        The random number
 */
export function getRandomizer(bottom, top) {
    return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
}
