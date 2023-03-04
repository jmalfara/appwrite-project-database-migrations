const migrate0 = require("./0_bootstrap_database");


const migrations = [
    migrate0,
]

module.exports = function (index) {
    console.log(index)
    return migrations.slice(index + 1, migrations.length)
}