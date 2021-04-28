/**
 * Translates Date Object into human readable format minutes, hours, days, and years
 *
 * @param  {Date} date      The Date how transform
 * @return {string}         The human readable date formatted dd/mm/YYYY HH/mm
 */
export function formatDate(date) {
    var day = date.getDate();
    var month = (date.getMonth() + 1);
    var hours = date.getHours();
    var minutes = date.getMinutes();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var strTime = hours + ':' + minutes;
    return day + '/' + month + '/' + date.getFullYear() + ' à ' + strTime;
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
