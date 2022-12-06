const CryptoJS = require('crypto-js');

function encryptString(data, encryptKey) {
    const encrypted = CryptoJS.AES.encrypt(data, encryptKey, {
        iv: CryptoJS.enc.Utf8.parse(''),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(encrypted.toString())
    );
}

function getStringMD5(s) {
    return CryptoJS.MD5(s).toString();
}

module.exports = {
    encryptString,
    getStringMD5,
};
