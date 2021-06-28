module.exports = token;

function token(length) {
    return rand(length) + rand(length); // to make it longer
};

function rand(length) {
    return Math.random().toString(length).substr(2); // remove `0.`
};