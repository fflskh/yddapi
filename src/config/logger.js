'use strict';
/**
 * Created by liuhao on 8/17/15.
 */
var LogConf = {
    "appenders": [{
        "type": "console"
    },
        {
            "type": "file",
            "filename": "apisys.log",
            "maxLogSize": 10240000,
            "backups": 3,
            "category": "apisys" //此处不能修改
        }
    ],
    "replaceConsole": true
}

module.exports = LogConf;
