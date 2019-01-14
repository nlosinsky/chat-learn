var winston = require('winston');
var isDev = process.env.NODE_ENV !== 'production';

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/');

    function customFormat() {
        return winston.format.printf(function(info) {
            return `${info.level}: [${path}] ${info.message}`;
        })
    }

    return winston.createLogger({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat()
        ),
        transports: [
            new winston.transports.Console({
                level: isDev ? 'debug' : 'error'
            })
        ]
    });
}

module.exports = getLogger;