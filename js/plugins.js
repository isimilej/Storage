
function callbackListener(result) {
    if (!pluginService.dispatchResult(result)) {
        alert("requestId: " + result.requestId + "\nisOk: " + result.isOk + "\nparams: " + JSON.stringify(result.params, null, 2))
    }
}

function callbackAppEvent(event) {
    let params = JSON.parse(event.params)
    if (event.eventName == "Navigate" && event.eventType == "back") {
        pluginService.goBack()
        return
    }
}

const pluginService = (function () {
    const callbacks = {}
    const items = []
    let requestSeed = 0
    let dataStore = {}
    return ({
        postMessage: function (request, callback) {
            if (!request.requestId) {
                request.requestId = this.nextRequestId(request)
            }
            if (callback) {
                callbacks[request.requestId] = callback
            }
            window.mbsNativeBridge.postMessage(JSON.stringify(request))
        },
        nextRequestId: function (request) {
            return request.service + "." + request.action + "." + requestSeed++
        },
        dispatchResult: function (result) {
            if (callbacks[result.requestId]) {
                let consumed = callbacks[result.requestId](result.isOk, result.params) != false
                if (consumed) {
                    delete callbacks[result.requestId]
                }
                return true
            } else {
                return false
            }
        },
        addItem: function (item) {
            items.push(item)
        },
        getItems: function () {
            return items
        },
        getData(key) {
            return dataStore[key]
        },
        setData(key, value) {
            return dataStore[key] = value
        },
        toast: function (message) {
            var request = {
                "service": "Toast",
                "action": "showToast",
                "params": { "message": message }
            }
            pluginService.postMessage(request, function () { })
        },
        goBack: function () {
            let request = {
                service: 'Navigator',
                action: 'goBack',
            }
            pluginService.postMessage(request, function () { })
        }
    })
})()

function plugin(name, items) {
    pluginService.addItem({ "name": name, "items": items })
}

function showLoading(message) {
    var request = {
        "service": "Loading",
        "action": "show",
        "params": {
            "message": message
        }
    }

    pluginService.postMessage(request, function (isOk, params) {
        console.log("showLoading...")
    })
}

function hideLoading() {
    var request = {
        "service": "Loading",
        "action": "hide",
    }
    pluginService.postMessage(request, function (isOk, params) {
        console.log("hideLoading...")
    })
}

// 플러그인 테스트 항목 정의
plugin("Sample & Scheme Intent & Non-Plugin", [
    {
        viewType: "button",
        buttonText: "JS Alert (표준)",
        onClick: function () {
            var message = ""
            for(var i = 0; i < 10; i++) {
                message += "안녕하세요. (" + i + ")\n"
            }
            alert(message)
        }
    },
    {
        viewType: "button",
        buttonText: "JS Confirm (표준)",
        onClick: function () {
            confirm("내용 (표준)")
        }
    },
    {
        viewType: "button",
        buttonText: "JS Confirm (JSON)",
        onClick: function () {
            var message = ""
            for(var i = 0; i < 200; i++) {
                message += "안녕하세요. (" + i + ")\n"
            }
            var params = {
                "title": "제목 (title)",
                "message": "내용 (message)\n" + message,
                "confirmText": "확인 (confirm)",
                "cancelText": "취소 (cancel)"
            }
            confirm(JSON.stringify(params))
        }
    },
])

plugin("Test", [
    {
        viewType: "button",
        buttonText: "Success",
        onClick: function () {
            var request = {
                "service": "Test",
                "action": "success",
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "Error",
        onClick: function () {
            var request = {
                "service": "Test",
                "action": "error",
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "Unknown Action",
        onClick: function () {
            var request = {
                "service": "Test",
                "action": "unknown",
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "Unknown Service",
        onClick: function () {
            var request = {
                "service": "Unknown",
                "action": "unknown",
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "Exception",
        onClick: function () {
            var request = {
                "service": "Test",
                "action": "exception",
            }
            pluginService.postMessage(request)
        },
    }
])

plugin("Toast", [
    {
        viewType: "button",
        buttonText: "show",
        onClick: function () {
            var request = {
                "service": "Toast",
                "action": "show",
                "params": {
                    "message": "hello,"
                }
            }
            pluginService.postMessage(request, function() {})
        },
    },
])

plugin("Camera", [
    {
        viewType: "button",
        buttonText: "Open",
        onClick: function () {
            var request = {
                "service": "Camera",
                "action": "open",
            }
            pluginService.postMessage(request, function() {})
        },
    },
])

plugin("Loading", [
    {
        viewType: "button",
        buttonText: "Loading.show",
        onClick: function () {
            var request = {
                "service": "Loading",
                "action": "show",
            }
            showLoading()
            setTimeout(hideLoading, 3000)
        },
    },
    {
        viewType: "button",
        buttonText: "Loading.hide",
        onClick: function () {
            var request = {
                "service": "Loading",
                "action": "hide",
            }
            hideLoading()
        },
    },
])

plugin("Gallery", [
    {
        viewType: "button",
        buttonText: "Gallery.Pick",
        onClick: function() {
            var request = {
                "service": "Gallery",
                "action": "pick",
            }
            pluginService.postMessage(request)
        }
    },
])

plugin("TransKeypad", [
    {
        viewType: "button",
        buttonText: "TransKeypad.show (Number)",
        onClick: function() {
            var request = {
                "service": "SecurityKeypad",
                "action": "show",
                "params": {
                    "type": "number"
                }
            }
            pluginService.postMessage(request)
        }
    },
    {
        viewType: "button",
        buttonText: "TransKeypad.show (String)",
        onClick: function() {
            var request = {
                "service": "SecurityKeypad",
                "action": "show",
                "params": {
                    "type": "string"
                }
            }
            pluginService.postMessage(request)
        },
    }
])

plugin("Navigator", [
    {
        viewType: "button",
        buttonText: "Navigator.logout",
        onClick: function() {
            var request = {
                "service": "Navigator",
                "action": "logout",
            }
            pluginService.postMessage(request)
        }
    },
    {
        viewType: "button",
        buttonText: "Navigator.goHome",
        onClick: function() {
            var request = {
                "service": "Navigator",
                "action": "goHome",
            }
            pluginService.postMessage(request)
        }
    },
    {
        viewType: "button",
        buttonText: "Navigator.exitApp",
        onClick: function() {
            var request = {
                "service": "Navigator",
                "action": "exitApp",
            }
            pluginService.postMessage(request)
        }
    }
])

plugin("MobileOcr", [
    {
        viewType: "button",
        buttonText: "신분증, 운전면허증 OCR",
        onClick: function () {
            var request = {
                "service": "MobileOcr",
                "action": "start",
                "params": {
                    "type": "id_card",
                    "captureBack": false,
                    "autoCapture": true,
                }
            }
            pluginService.postMessage(request)
        }
    },
    {
        viewType: "button",
        buttonText: "구여권 OCR",
        onClick: function () {
            var request = {
                "service": "MobileOcr",
                "action": "start",
                "params": {
                    "type": "passport",
                    "autoCapture": true,
                    "enablePreviewRecog": true
                }
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "신여권 OCR",
        onClick: function () {
            var request = {
                "service": "MobileOcr",
                "action": "start",
                "params": {
                    "type": "passport",
                    "autoCapture": true,
                    "enablePreviewRecog": false
                }
            }
            pluginService.postMessage(request)
        },
    },
    {
        viewType: "button",
        buttonText: "문서 OCR",
        onClick: function () {
            var request = {
               "service": "MobileOcr",
               "action": "start",
               "params": {
                   "type": "document",
                   "documentCount": 10
               }
            }
            pluginService.postMessage(request)
        },
    },
    {
            viewType: "button",
            buttonText: "일반 OCR",
            onClick: function () {
                var request = {
                   "service": "MobileOcr",
                   "action": "start",
                   "params": {
                       "type": "other",
                       "documentCount": 10
                   }
                }
                pluginService.postMessage(request)
            },
        },
])

plugin("MbsClient", [
    {
        viewType: "button",
        buttonText: "MbsClient.post",
        onClick: function() {
            var request = {
                "service": "MbsClient",
                "action": "post",
                "params": {
                    "uri": "/api/v1/login/1",
                    "request": {
                        "header": {
                            "uri": "/api/v1/login/1"
                        },
                        "body": {
                            "username": "ibk"
                        }
                    }
                }
            }
            pluginService.postMessage(request)
        }
    }  
])

plugin("BidMessage", [
    {
        viewType: "button",
        buttonText: "fetch",
        onClick: function() {
            var request = {
                "service": "BidMessage",
                "action": "fetch"
            }
            pluginService.postMessage(request)
        }
    }
])