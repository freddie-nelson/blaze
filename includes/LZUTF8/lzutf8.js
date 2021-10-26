/*!
 LZ-UTF8 v0.5.8

 Copyright (c) 2021, Rotem Dan
 Released under the MIT license.

 Build date: 2021-02-24 

 Please report any issue at https://github.com/rotemdan/lzutf8.js/issues
*/
var IE10SubarrayBugPatcher, LZUTF8;
!(function (n) {
  (n.runningInNodeJS = function () {
    return (
      "object" == typeof process &&
      "object" == typeof process.versions &&
      "string" == typeof process.versions.node
    );
  }),
    (n.runningInMainNodeJSModule = function () {
      return n.runningInNodeJS() && require.main === module;
    }),
    (n.commonJSAvailable = function () {
      return "object" == typeof module && "object" == typeof module.exports;
    }),
    (n.runningInWebWorker = function () {
      return (
        "undefined" == typeof window &&
        "object" == typeof self &&
        "function" == typeof self.addEventListener &&
        "function" == typeof self.close
      );
    }),
    (n.runningInNodeChildProcess = function () {
      return n.runningInNodeJS() && "function" == typeof process.send;
    }),
    (n.runningInNullOrigin = function () {
      return (
        "object" == typeof window &&
        "object" == typeof window.location &&
        "object" == typeof document &&
        "http:" !== document.location.protocol &&
        "https:" !== document.location.protocol
      );
    }),
    (n.webWorkersAvailable = function () {
      return (
        "function" == typeof Worker &&
        !n.runningInNullOrigin() &&
        !n.runningInNodeJS() &&
        !(navigator && navigator.userAgent && 0 <= navigator.userAgent.indexOf("Android 4.3"))
      );
    }),
    (n.log = function (e, t) {
      void 0 === t && (t = !1),
        "object" == typeof console &&
          (console.log(e), t && "object" == typeof document && (document.body.innerHTML += e + "<br/>"));
    }),
    (n.createErrorMessage = function (e, t) {
      if ((void 0 === t && (t = "Unhandled exception"), null == e)) return t;
      if (((t += ": "), "object" != typeof e.content))
        return "string" == typeof e.content ? t + e.content : t + e;
      if (n.runningInNodeJS()) return t + e.content.stack;
      var r = JSON.stringify(e.content);
      return "{}" !== r ? t + r : t + e.content;
    }),
    (n.printExceptionAndStackTraceToConsole = function (e, t) {
      void 0 === t && (t = "Unhandled exception"), n.log(n.createErrorMessage(e, t));
    }),
    (n.getGlobalObject = function () {
      return "object" == typeof global
        ? global
        : "object" == typeof window
        ? window
        : "object" == typeof self
        ? self
        : {};
    }),
    (n.toString = Object.prototype.toString),
    n.commonJSAvailable() && (module.exports = n);
})((LZUTF8 = LZUTF8 || {})),
  (function () {
    if ("function" == typeof Uint8Array && 0 !== new Uint8Array(1).subarray(1).byteLength) {
      function e(e, t) {
        var r = function (e, t, r) {
          return e < t ? t : r < e ? r : e;
        };
        (e |= 0),
          (t |= 0),
          arguments.length < 1 && (e = 0),
          arguments.length < 2 && (t = this.length),
          e < 0 && (e = this.length + e),
          t < 0 && (t = this.length + t),
          (e = r(e, 0, this.length));
        r = (t = r(t, 0, this.length)) - e;
        return (
          r < 0 && (r = 0), new this.constructor(this.buffer, this.byteOffset + e * this.BYTES_PER_ELEMENT, r)
        );
      }
      var t = [
          "Int8Array",
          "Uint8Array",
          "Uint8ClampedArray",
          "Int16Array",
          "Uint16Array",
          "Int32Array",
          "Uint32Array",
          "Float32Array",
          "Float64Array",
        ],
        r = void 0;
      if (("object" == typeof window ? (r = window) : "object" == typeof self && (r = self), void 0 !== r))
        for (var n = 0; n < t.length; n++) r[t[n]] && (r[t[n]].prototype.subarray = e);
    }
  })((IE10SubarrayBugPatcher = IE10SubarrayBugPatcher || {})),
  (function (f) {
    var e =
      ((t.compressAsync = function (e, n, o) {
        var i = new f.Timer(),
          u = new f.Compressor();
        if (!o) throw new TypeError("compressAsync: No callback argument given");
        if ("string" == typeof e) e = f.encodeUTF8(e);
        else if (null == e || !(e instanceof Uint8Array))
          return void o(
            void 0,
            new TypeError(
              "compressAsync: Invalid input argument, only 'string' and 'Uint8Array' are supported"
            )
          );
        var s = f.ArrayTools.splitByteArray(e, n.blockSize),
          a = [],
          c = function (e) {
            if (e < s.length) {
              var t = void 0;
              try {
                t = u.compressBlock(s[e]);
              } catch (e) {
                return void o(void 0, e);
              }
              a.push(t),
                i.getElapsedTime() <= 20
                  ? c(e + 1)
                  : (f.enqueueImmediate(function () {
                      return c(e + 1);
                    }),
                    i.restart());
            } else {
              var r = f.ArrayTools.concatUint8Arrays(a);
              f.enqueueImmediate(function () {
                var e;
                try {
                  e = f.CompressionCommon.encodeCompressedBytes(r, n.outputEncoding);
                } catch (e) {
                  return void o(void 0, e);
                }
                f.enqueueImmediate(function () {
                  return o(e);
                });
              });
            }
          };
        f.enqueueImmediate(function () {
          return c(0);
        });
      }),
      (t.createCompressionStream = function () {
        var o = new f.Compressor(),
          // i = new (require("readable-stream").Transform)({ decodeStrings: !0, highWaterMark: 65536 });
          i = undefined;
        return (
          (i._transform = function (e, t, r) {
            var n;
            try {
              n = f.BufferTools.uint8ArrayToBuffer(o.compressBlock(f.BufferTools.bufferToUint8Array(e)));
            } catch (e) {
              return void i.emit("error", e);
            }
            i.push(n), r();
          }),
          i
        );
      }),
      t);
    function t() {}
    f.AsyncCompressor = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (f) {
    var e =
      ((t.decompressAsync = function (e, n, o) {
        if (!o) throw new TypeError("decompressAsync: No callback argument given");
        var i = new f.Timer();
        try {
          e = f.CompressionCommon.decodeCompressedBytes(e, n.inputEncoding);
        } catch (e) {
          return void o(void 0, e);
        }
        var u = new f.Decompressor(),
          s = f.ArrayTools.splitByteArray(e, n.blockSize),
          a = [],
          c = function (e) {
            if (e < s.length) {
              var t = void 0;
              try {
                t = u.decompressBlock(s[e]);
              } catch (e) {
                return void o(void 0, e);
              }
              a.push(t),
                i.getElapsedTime() <= 20
                  ? c(e + 1)
                  : (f.enqueueImmediate(function () {
                      return c(e + 1);
                    }),
                    i.restart());
            } else {
              var r = f.ArrayTools.concatUint8Arrays(a);
              f.enqueueImmediate(function () {
                var e;
                try {
                  e = f.CompressionCommon.encodeDecompressedBytes(r, n.outputEncoding);
                } catch (e) {
                  return void o(void 0, e);
                }
                f.enqueueImmediate(function () {
                  return o(e);
                });
              });
            }
          };
        f.enqueueImmediate(function () {
          return c(0);
        });
      }),
      (t.createDecompressionStream = function () {
        var o = new f.Decompressor(),
          // i = new (require("readable-stream").Transform)({ decodeStrings: !0, highWaterMark: 65536 });
          i = undefined;
        return (
          (i._transform = function (e, t, r) {
            var n;
            try {
              n = f.BufferTools.uint8ArrayToBuffer(o.decompressBlock(f.BufferTools.bufferToUint8Array(e)));
            } catch (e) {
              return void i.emit("error", e);
            }
            i.push(n), r();
          }),
          i
        );
      }),
      t);
    function t() {}
    f.AsyncDecompressor = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (i) {
    var e, u;
    ((u = e = i.WebWorker || (i.WebWorker = {})).compressAsync = function (e, t, r) {
      var n, o;
      "ByteArray" != t.inputEncoding || e instanceof Uint8Array
        ? ((n = {
            token: Math.random().toString(),
            type: "compress",
            data: e,
            inputEncoding: t.inputEncoding,
            outputEncoding: t.outputEncoding,
          }),
          (o = function (e) {
            e = e.data;
            e &&
              e.token == n.token &&
              (u.globalWorker.removeEventListener("message", o),
              "error" == e.type ? r(void 0, new Error(e.error)) : r(e.data));
          }),
          u.globalWorker.addEventListener("message", o),
          u.globalWorker.postMessage(n, []))
        : r(void 0, new TypeError("compressAsync: input is not a Uint8Array"));
    }),
      (u.decompressAsync = function (e, t, r) {
        var n = {
            token: Math.random().toString(),
            type: "decompress",
            data: e,
            inputEncoding: t.inputEncoding,
            outputEncoding: t.outputEncoding,
          },
          o = function (e) {
            e = e.data;
            e &&
              e.token == n.token &&
              (u.globalWorker.removeEventListener("message", o),
              "error" == e.type ? r(void 0, new Error(e.error)) : r(e.data));
          };
        u.globalWorker.addEventListener("message", o), u.globalWorker.postMessage(n, []);
      }),
      (u.installWebWorkerIfNeeded = function () {
        "object" == typeof self &&
          void 0 === self.document &&
          null != self.addEventListener &&
          (self.addEventListener("message", function (e) {
            var t = e.data;
            if ("compress" == t.type) {
              var r = void 0;
              try {
                r = i.compress(t.data, { outputEncoding: t.outputEncoding });
              } catch (e) {
                return void self.postMessage(
                  { token: t.token, type: "error", error: i.createErrorMessage(e) },
                  []
                );
              }
              (n = { token: t.token, type: "compressionResult", data: r, encoding: t.outputEncoding })
                .data instanceof Uint8Array && -1 === navigator.appVersion.indexOf("MSIE 10")
                ? self.postMessage(n, [n.data.buffer])
                : self.postMessage(n, []);
            } else if ("decompress" == t.type) {
              var n,
                o = void 0;
              try {
                o = i.decompress(t.data, {
                  inputEncoding: t.inputEncoding,
                  outputEncoding: t.outputEncoding,
                });
              } catch (e) {
                return void self.postMessage(
                  { token: t.token, type: "error", error: i.createErrorMessage(e) },
                  []
                );
              }
              (n = { token: t.token, type: "decompressionResult", data: o, encoding: t.outputEncoding })
                .data instanceof Uint8Array && -1 === navigator.appVersion.indexOf("MSIE 10")
                ? self.postMessage(n, [n.data.buffer])
                : self.postMessage(n, []);
            }
          }),
          self.addEventListener("error", function (e) {
            i.log(i.createErrorMessage(e.error, "Unexpected LZUTF8 WebWorker exception"));
          }));
      }),
      (u.createGlobalWorkerIfNeeded = function () {
        return (
          !!u.globalWorker ||
          (!!i.webWorkersAvailable() &&
            (u.scriptURI ||
              "object" != typeof document ||
              (null != (e = document.getElementById("lzutf8")) &&
                (u.scriptURI = e.getAttribute("src") || void 0)),
            !!u.scriptURI && ((u.globalWorker = new Worker(u.scriptURI)), !0)))
        );
        var e;
      }),
      (u.terminate = function () {
        u.globalWorker && (u.globalWorker.terminate(), (u.globalWorker = void 0));
      }),
      e.installWebWorkerIfNeeded();
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var t =
      ((r.prototype.get = function (e) {
        return this.container[this.startPosition + e];
      }),
      (r.prototype.getInReversedOrder = function (e) {
        return this.container[this.startPosition + this.length - 1 - e];
      }),
      (r.prototype.set = function (e, t) {
        this.container[this.startPosition + e] = t;
      }),
      r);
    function r(e, t, r) {
      (this.container = e), (this.startPosition = t), (this.length = r);
    }
    e.ArraySegment = t;
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    ((e = e.ArrayTools || (e.ArrayTools = {})).copyElements = function (e, t, r, n, o) {
      for (; o--; ) r[n++] = e[t++];
    }),
      (e.zeroElements = function (e, t, r) {
        for (; r--; ) e[t++] = 0;
      }),
      (e.countNonzeroValuesInArray = function (e) {
        for (var t = 0, r = 0; r < e.length; r++) e[r] && t++;
        return t;
      }),
      (e.truncateStartingElements = function (e, t) {
        if (e.length <= t)
          throw new RangeError(
            "truncateStartingElements: Requested length should be smaller than array length"
          );
        for (var r = e.length - t, n = 0; n < t; n++) e[n] = e[r + n];
        e.length = t;
      }),
      (e.doubleByteArrayCapacity = function (e) {
        var t = new Uint8Array(2 * e.length);
        return t.set(e), t;
      }),
      (e.concatUint8Arrays = function (e) {
        for (var t = 0, r = 0, n = e; r < n.length; r++) t += (a = n[r]).length;
        for (var o = new Uint8Array(t), i = 0, u = 0, s = e; u < s.length; u++) {
          var a = s[u];
          o.set(a, i), (i += a.length);
        }
        return o;
      }),
      (e.splitByteArray = function (e, t) {
        for (var r = [], n = 0; n < e.length; ) {
          var o = Math.min(t, e.length - n);
          r.push(e.subarray(n, n + o)), (n += o);
        }
        return r;
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var t;
    ((t = e.BufferTools || (e.BufferTools = {})).convertToUint8ArrayIfNeeded = function (e) {
      return "function" == typeof Buffer && Buffer.isBuffer(e) ? t.bufferToUint8Array(e) : e;
    }),
      (t.uint8ArrayToBuffer = function (e) {
        if (Buffer.prototype instanceof Uint8Array) {
          var t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
          return Object.setPrototypeOf(t, Buffer.prototype), t;
        }
        for (var r = e.length, n = new Buffer(r), o = 0; o < r; o++) n[o] = e[o];
        return n;
      }),
      (t.bufferToUint8Array = function (e) {
        if (Buffer.prototype instanceof Uint8Array)
          return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
        for (var t = e.length, r = new Uint8Array(t), n = 0; n < t; n++) r[n] = e[n];
        return r;
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (o) {
    var e;
    ((e = o.CompressionCommon || (o.CompressionCommon = {})).getCroppedBuffer = function (e, t, r, n) {
      void 0 === n && (n = 0);
      n = new Uint8Array(r + n);
      return n.set(e.subarray(t, t + r)), n;
    }),
      (e.getCroppedAndAppendedByteArray = function (e, t, r, n) {
        return o.ArrayTools.concatUint8Arrays([e.subarray(t, t + r), n]);
      }),
      (e.detectCompressionSourceEncoding = function (e) {
        if (null == e) throw new TypeError("detectCompressionSourceEncoding: input is null or undefined");
        if ("string" == typeof e) return "String";
        if (e instanceof Uint8Array || ("function" == typeof Buffer && Buffer.isBuffer(e)))
          return "ByteArray";
        throw new TypeError(
          "detectCompressionSourceEncoding: input must be of type 'string', 'Uint8Array' or 'Buffer'"
        );
      }),
      (e.encodeCompressedBytes = function (e, t) {
        switch (t) {
          case "ByteArray":
            return e;
          case "Buffer":
            return o.BufferTools.uint8ArrayToBuffer(e);
          case "Base64":
            return o.encodeBase64(e);
          case "BinaryString":
            return o.encodeBinaryString(e);
          case "StorageBinaryString":
            return o.encodeStorageBinaryString(e);
          default:
            throw new TypeError("encodeCompressedBytes: invalid output encoding requested");
        }
      }),
      (e.decodeCompressedBytes = function (e, t) {
        if (null == t) throw new TypeError("decodeCompressedData: Input is null or undefined");
        switch (t) {
          case "ByteArray":
          case "Buffer":
            var r = o.BufferTools.convertToUint8ArrayIfNeeded(e);
            if (!(r instanceof Uint8Array))
              throw new TypeError(
                "decodeCompressedData: 'ByteArray' or 'Buffer' input type was specified but input is not a Uint8Array or Buffer"
              );
            return r;
          case "Base64":
            if ("string" != typeof e)
              throw new TypeError(
                "decodeCompressedData: 'Base64' input type was specified but input is not a string"
              );
            return o.decodeBase64(e);
          case "BinaryString":
            if ("string" != typeof e)
              throw new TypeError(
                "decodeCompressedData: 'BinaryString' input type was specified but input is not a string"
              );
            return o.decodeBinaryString(e);
          case "StorageBinaryString":
            if ("string" != typeof e)
              throw new TypeError(
                "decodeCompressedData: 'StorageBinaryString' input type was specified but input is not a string"
              );
            return o.decodeStorageBinaryString(e);
          default:
            throw new TypeError("decodeCompressedData: invalid input encoding requested: '" + t + "'");
        }
      }),
      (e.encodeDecompressedBytes = function (e, t) {
        switch (t) {
          case "String":
            return o.decodeUTF8(e);
          case "ByteArray":
            return e;
          case "Buffer":
            if ("function" != typeof Buffer)
              throw new TypeError(
                "encodeDecompressedBytes: a 'Buffer' type was specified but is not supported at the current envirnment"
              );
            return o.BufferTools.uint8ArrayToBuffer(e);
          default:
            throw new TypeError("encodeDecompressedBytes: invalid output encoding requested");
        }
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (o) {
    var t, e, i, u;
    (e = t = o.EventLoop || (o.EventLoop = {})),
      (u = []),
      (e.enqueueImmediate = function (e) {
        u.push(e), 1 === u.length && i();
      }),
      (e.initializeScheduler = function () {
        function t() {
          for (var e = 0, t = u; e < t.length; e++) {
            var r = t[e];
            try {
              r.call(void 0);
            } catch (e) {
              o.printExceptionAndStackTraceToConsole(e, "enqueueImmediate exception");
            }
          }
          u.length = 0;
        }
        var r, e, n;
        o.runningInNodeJS() &&
          (i = function () {
            return setImmediate(t);
          }),
          (i =
            "object" == typeof window &&
            "function" == typeof window.addEventListener &&
            "function" == typeof window.postMessage
              ? ((r = "enqueueImmediate-" + Math.random().toString()),
                window.addEventListener("message", function (e) {
                  e.data === r && t();
                }),
                (e = o.runningInNullOrigin() ? "*" : window.location.href),
                function () {
                  return window.postMessage(r, e);
                })
              : "function" == typeof MessageChannel && "function" == typeof MessagePort
              ? (((n = new MessageChannel()).port1.onmessage = t),
                function () {
                  return n.port2.postMessage(0);
                })
              : function () {
                  return setTimeout(t, 0);
                });
      }),
      e.initializeScheduler(),
      (o.enqueueImmediate = function (e) {
        return t.enqueueImmediate(e);
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var r;
    ((r = e.ObjectTools || (e.ObjectTools = {})).override = function (e, t) {
      return r.extend(e, t);
    }),
      (r.extend = function (e, t) {
        if (null == e) throw new TypeError("obj is null or undefined");
        if ("object" != typeof e) throw new TypeError("obj is not an object");
        if ((null == t && (t = {}), "object" != typeof t))
          throw new TypeError("newProperties is not an object");
        if (null != t) for (var r in t) e[r] = t[r];
        return e;
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (o) {
    (o.getRandomIntegerInRange = function (e, t) {
      return e + Math.floor(Math.random() * (t - e));
    }),
      (o.getRandomUTF16StringOfLength = function (e) {
        for (var t = "", r = 0; r < e; r++) {
          for (var n = void 0; (n = o.getRandomIntegerInRange(0, 1114112)), 55296 <= n && n <= 57343; );
          t += o.Encoding.CodePoint.decodeToString(n);
        }
        return t;
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var t =
      ((r.prototype.appendCharCode = function (e) {
        (this.outputBuffer[this.outputPosition++] = e),
          this.outputPosition === this.outputBufferCapacity && this.flushBufferToOutputString();
      }),
      (r.prototype.appendCharCodes = function (e) {
        for (var t = 0, r = e.length; t < r; t++) this.appendCharCode(e[t]);
      }),
      (r.prototype.appendString = function (e) {
        for (var t = 0, r = e.length; t < r; t++) this.appendCharCode(e.charCodeAt(t));
      }),
      (r.prototype.appendCodePoint = function (e) {
        if (e <= 65535) this.appendCharCode(e);
        else {
          if (!(e <= 1114111))
            throw new Error("appendCodePoint: A code point of " + e + " cannot be encoded in UTF-16");
          this.appendCharCode(55296 + ((e - 65536) >>> 10)),
            this.appendCharCode(56320 + ((e - 65536) & 1023));
        }
      }),
      (r.prototype.getOutputString = function () {
        return this.flushBufferToOutputString(), this.outputString;
      }),
      (r.prototype.flushBufferToOutputString = function () {
        this.outputPosition === this.outputBufferCapacity
          ? (this.outputString += String.fromCharCode.apply(null, this.outputBuffer))
          : (this.outputString += String.fromCharCode.apply(
              null,
              this.outputBuffer.subarray(0, this.outputPosition)
            )),
          (this.outputPosition = 0);
      }),
      r);
    function r(e) {
      void 0 === e && (e = 1024),
        (this.outputBufferCapacity = e),
        (this.outputPosition = 0),
        (this.outputString = ""),
        (this.outputBuffer = new Uint16Array(this.outputBufferCapacity));
    }
    e.StringBuilder = t;
  })((LZUTF8 = LZUTF8 || {})),
  (function (n) {
    var e =
      ((t.prototype.restart = function () {
        this.startTime = t.getTimestamp();
      }),
      (t.prototype.getElapsedTime = function () {
        return t.getTimestamp() - this.startTime;
      }),
      (t.prototype.getElapsedTimeAndRestart = function () {
        var e = this.getElapsedTime();
        return this.restart(), e;
      }),
      (t.prototype.logAndRestart = function (e, t) {
        void 0 === t && (t = !0);
        var r = this.getElapsedTime(),
          e = e + ": " + r.toFixed(3) + "ms";
        return n.log(e, t), this.restart(), r;
      }),
      (t.getTimestamp = function () {
        return this.timestampFunc || this.createGlobalTimestampFunction(), this.timestampFunc();
      }),
      (t.getMicrosecondTimestamp = function () {
        return Math.floor(1e3 * t.getTimestamp());
      }),
      (t.createGlobalTimestampFunction = function () {
        var t, e, r, n;
        "object" == typeof process && "function" == typeof process.hrtime
          ? ((t = 0),
            (this.timestampFunc = function () {
              var e = process.hrtime(),
                e = 1e3 * e[0] + e[1] / 1e6;
              return t + e;
            }),
            (t = Date.now() - this.timestampFunc()))
          : "object" == typeof chrome && chrome.Interval
          ? ((e = Date.now()),
            (r = new chrome.Interval()).start(),
            (this.timestampFunc = function () {
              return e + r.microseconds() / 1e3;
            }))
          : "object" == typeof performance && performance.now
          ? ((n = Date.now() - performance.now()),
            (this.timestampFunc = function () {
              return n + performance.now();
            }))
          : Date.now
          ? (this.timestampFunc = function () {
              return Date.now();
            })
          : (this.timestampFunc = function () {
              return new Date().getTime();
            });
      }),
      t);
    function t() {
      this.restart();
    }
    n.Timer = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (n) {
    var e =
      ((t.prototype.compressBlock = function (e) {
        if (null == e) throw new TypeError("compressBlock: undefined or null input received");
        return (
          "string" == typeof e && (e = n.encodeUTF8(e)),
          (e = n.BufferTools.convertToUint8ArrayIfNeeded(e)),
          this.compressUtf8Block(e)
        );
      }),
      (t.prototype.compressUtf8Block = function (e) {
        if (!e || 0 == e.length) return new Uint8Array(0);
        var t = this.cropAndAddNewBytesToInputBuffer(e),
          r = this.inputBuffer,
          n = this.inputBuffer.length;
        this.outputBuffer = new Uint8Array(e.length);
        for (var o = (this.outputBufferPosition = 0), i = t; i < n; i++) {
          var u,
            s,
            a = r[i],
            c = i < o;
          i > n - this.MinimumSequenceLength
            ? c || this.outputRawByte(a)
            : ((u = this.getBucketIndexForPrefix(i)),
              c ||
                (null != (s = this.findLongestMatch(i, u)) &&
                  (this.outputPointerBytes(s.length, s.distance), (o = i + s.length), (c = !0))),
              c || this.outputRawByte(a),
              (a = this.inputBufferStreamOffset + i),
              this.prefixHashTable.addValueToBucket(u, a));
        }
        return this.outputBuffer.subarray(0, this.outputBufferPosition);
      }),
      (t.prototype.findLongestMatch = function (e, t) {
        var r = this.prefixHashTable.getArraySegmentForBucketIndex(t, this.reusableArraySegmentObject);
        if (null == r) return null;
        for (var n, o = this.inputBuffer, i = 0, u = 0; u < r.length; u++) {
          var s = r.getInReversedOrder(u) - this.inputBufferStreamOffset,
            a = e - s,
            c = void 0,
            c = void 0 === n ? this.MinimumSequenceLength - 1 : n < 128 && 128 <= a ? i + (i >>> 1) : i;
          if (a > this.MaximumMatchDistance || c >= this.MaximumSequenceLength || e + c >= o.length) break;
          if (o[s + c] === o[e + c])
            for (var f = 0; ; f++) {
              if (e + f === o.length || o[s + f] !== o[e + f]) {
                c < f && ((n = a), (i = f));
                break;
              }
              if (f === this.MaximumSequenceLength)
                return { distance: a, length: this.MaximumSequenceLength };
            }
        }
        return void 0 !== n ? { distance: n, length: i } : null;
      }),
      (t.prototype.getBucketIndexForPrefix = function (e) {
        return (
          (7880599 * this.inputBuffer[e] +
            39601 * this.inputBuffer[e + 1] +
            199 * this.inputBuffer[e + 2] +
            this.inputBuffer[e + 3]) %
          this.PrefixHashTableSize
        );
      }),
      (t.prototype.outputPointerBytes = function (e, t) {
        t < 128
          ? (this.outputRawByte(192 | e), this.outputRawByte(t))
          : (this.outputRawByte(224 | e), this.outputRawByte(t >>> 8), this.outputRawByte(255 & t));
      }),
      (t.prototype.outputRawByte = function (e) {
        this.outputBuffer[this.outputBufferPosition++] = e;
      }),
      (t.prototype.cropAndAddNewBytesToInputBuffer = function (e) {
        if (void 0 === this.inputBuffer) return (this.inputBuffer = e), 0;
        var t = Math.min(this.inputBuffer.length, this.MaximumMatchDistance),
          r = this.inputBuffer.length - t;
        return (
          (this.inputBuffer = n.CompressionCommon.getCroppedAndAppendedByteArray(this.inputBuffer, r, t, e)),
          (this.inputBufferStreamOffset += r),
          t
        );
      }),
      t);
    function t(e) {
      void 0 === e && (e = !0),
        (this.MinimumSequenceLength = 4),
        (this.MaximumSequenceLength = 31),
        (this.MaximumMatchDistance = 32767),
        (this.PrefixHashTableSize = 65537),
        (this.inputBufferStreamOffset = 1),
        e && "function" == typeof Uint32Array
          ? (this.prefixHashTable = new n.CompressorCustomHashTable(this.PrefixHashTableSize))
          : (this.prefixHashTable = new n.CompressorSimpleHashTable(this.PrefixHashTableSize));
    }
    n.Compressor = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (s) {
    var e =
      ((t.prototype.addValueToBucket = function (e, t) {
        (e <<= 1), this.storageIndex >= this.storage.length >>> 1 && this.compact();
        var r,
          n,
          o = this.bucketLocators[e];
        0 === o
          ? ((o = this.storageIndex),
            (r = 1),
            (this.storage[this.storageIndex] = t),
            (this.storageIndex += this.minimumBucketCapacity))
          : ((r = this.bucketLocators[e + 1]) === this.maximumBucketCapacity - 1 &&
              (r = this.truncateBucketToNewerElements(o, r, this.maximumBucketCapacity / 2)),
            (n = o + r),
            0 === this.storage[n]
              ? ((this.storage[n] = t), n === this.storageIndex && (this.storageIndex += r))
              : (s.ArrayTools.copyElements(this.storage, o, this.storage, this.storageIndex, r),
                (o = this.storageIndex),
                (this.storageIndex += r),
                (this.storage[this.storageIndex++] = t),
                (this.storageIndex += r)),
            r++),
          (this.bucketLocators[e] = o),
          (this.bucketLocators[e + 1] = r);
      }),
      (t.prototype.truncateBucketToNewerElements = function (e, t, r) {
        var n = e + t - r;
        return (
          s.ArrayTools.copyElements(this.storage, n, this.storage, e, r),
          s.ArrayTools.zeroElements(this.storage, e + r, t - r),
          r
        );
      }),
      (t.prototype.compact = function () {
        var e = this.bucketLocators,
          t = this.storage;
        (this.bucketLocators = new Uint32Array(this.bucketLocators.length)), (this.storageIndex = 1);
        for (var r = 0; r < e.length; r += 2) {
          var n = e[r + 1];
          0 !== n &&
            ((this.bucketLocators[r] = this.storageIndex),
            (this.bucketLocators[r + 1] = n),
            (this.storageIndex += Math.max(
              Math.min(2 * n, this.maximumBucketCapacity),
              this.minimumBucketCapacity
            )));
        }
        this.storage = new Uint32Array(8 * this.storageIndex);
        for (r = 0; r < e.length; r += 2) {
          var o,
            i,
            u = e[r];
          0 !== u &&
            ((o = this.bucketLocators[r]),
            (i = this.bucketLocators[r + 1]),
            s.ArrayTools.copyElements(t, u, this.storage, o, i));
        }
      }),
      (t.prototype.getArraySegmentForBucketIndex = function (e, t) {
        e <<= 1;
        var r = this.bucketLocators[e];
        return 0 === r
          ? null
          : (void 0 === t && (t = new s.ArraySegment(this.storage, r, this.bucketLocators[e + 1])), t);
      }),
      (t.prototype.getUsedBucketCount = function () {
        return Math.floor(s.ArrayTools.countNonzeroValuesInArray(this.bucketLocators) / 2);
      }),
      (t.prototype.getTotalElementCount = function () {
        for (var e = 0, t = 0; t < this.bucketLocators.length; t += 2) e += this.bucketLocators[t + 1];
        return e;
      }),
      t);
    function t(e) {
      (this.minimumBucketCapacity = 4),
        (this.maximumBucketCapacity = 64),
        (this.bucketLocators = new Uint32Array(2 * e)),
        (this.storage = new Uint32Array(2 * e)),
        (this.storageIndex = 1);
    }
    s.CompressorCustomHashTable = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (n) {
    var e =
      ((t.prototype.addValueToBucket = function (e, t) {
        var r = this.buckets[e];
        void 0 === r
          ? (this.buckets[e] = [t])
          : (r.length === this.maximumBucketCapacity - 1 &&
              n.ArrayTools.truncateStartingElements(r, this.maximumBucketCapacity / 2),
            r.push(t));
      }),
      (t.prototype.getArraySegmentForBucketIndex = function (e, t) {
        e = this.buckets[e];
        return void 0 === e ? null : (void 0 === t && (t = new n.ArraySegment(e, 0, e.length)), t);
      }),
      (t.prototype.getUsedBucketCount = function () {
        return n.ArrayTools.countNonzeroValuesInArray(this.buckets);
      }),
      (t.prototype.getTotalElementCount = function () {
        for (var e = 0, t = 0; t < this.buckets.length; t++)
          void 0 !== this.buckets[t] && (e += this.buckets[t].length);
        return e;
      }),
      t);
    function t(e) {
      (this.maximumBucketCapacity = 64), (this.buckets = new Array(e));
    }
    n.CompressorSimpleHashTable = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (f) {
    var e =
      ((t.prototype.decompressBlockToString = function (e) {
        return (e = f.BufferTools.convertToUint8ArrayIfNeeded(e)), f.decodeUTF8(this.decompressBlock(e));
      }),
      (t.prototype.decompressBlock = function (e) {
        this.inputBufferRemainder &&
          ((e = f.ArrayTools.concatUint8Arrays([this.inputBufferRemainder, e])),
          (this.inputBufferRemainder = void 0));
        for (
          var t = this.cropOutputBufferToWindowAndInitialize(Math.max(4 * e.length, 1024)),
            r = 0,
            n = e.length;
          r < n;
          r++
        ) {
          var o = e[r];
          if (o >>> 6 == 3) {
            var i = o >>> 5;
            if (r == n - 1 || (r == n - 2 && 7 == i)) {
              this.inputBufferRemainder = e.subarray(r);
              break;
            }
            if (e[r + 1] >>> 7 == 1) this.outputByte(o);
            else {
              var u = 31 & o,
                s = void 0;
              6 == i ? ((s = e[r + 1]), (r += 1)) : ((s = (e[r + 1] << 8) | e[r + 2]), (r += 2));
              for (var a = this.outputPosition - s, c = 0; c < u; c++)
                this.outputByte(this.outputBuffer[a + c]);
            }
          } else this.outputByte(o);
        }
        return (
          this.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence(),
          f.CompressionCommon.getCroppedBuffer(this.outputBuffer, t, this.outputPosition - t)
        );
      }),
      (t.prototype.outputByte = function (e) {
        this.outputPosition === this.outputBuffer.length &&
          (this.outputBuffer = f.ArrayTools.doubleByteArrayCapacity(this.outputBuffer)),
          (this.outputBuffer[this.outputPosition++] = e);
      }),
      (t.prototype.cropOutputBufferToWindowAndInitialize = function (e) {
        if (!this.outputBuffer) return (this.outputBuffer = new Uint8Array(e)), 0;
        var t = Math.min(this.outputPosition, this.MaximumMatchDistance);
        if (
          ((this.outputBuffer = f.CompressionCommon.getCroppedBuffer(
            this.outputBuffer,
            this.outputPosition - t,
            t,
            e
          )),
          (this.outputPosition = t),
          this.outputBufferRemainder)
        ) {
          for (var r = 0; r < this.outputBufferRemainder.length; r++)
            this.outputByte(this.outputBufferRemainder[r]);
          this.outputBufferRemainder = void 0;
        }
        return t;
      }),
      (t.prototype.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence = function () {
        for (var e = 1; e <= 4 && 0 <= this.outputPosition - e; e++) {
          var t = this.outputBuffer[this.outputPosition - e];
          if ((e < 4 && t >>> 3 == 30) || (e < 3 && t >>> 4 == 14) || (e < 2 && t >>> 5 == 6))
            return (
              (this.outputBufferRemainder = this.outputBuffer.subarray(
                this.outputPosition - e,
                this.outputPosition
              )),
              void (this.outputPosition -= e)
            );
        }
      }),
      t);
    function t() {
      (this.MaximumMatchDistance = 32767), (this.outputPosition = 0);
    }
    f.Decompressor = e;
  })((LZUTF8 = LZUTF8 || {})),
  (function (s) {
    var e, t, a, c;
    (e = s.Encoding || (s.Encoding = {})),
      (t = e.Base64 || (e.Base64 = {})),
      (a = new Uint8Array([
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
        90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116,
        117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47,
      ])),
      (c = new Uint8Array([
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255,
        255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 50, 51, 255, 255, 255, 255,
      ])),
      (t.encode = function (e) {
        return e && 0 != e.length
          ? s.runningInNodeJS()
            ? s.BufferTools.uint8ArrayToBuffer(e).toString("base64")
            : t.encodeWithJS(e)
          : "";
      }),
      (t.decode = function (e) {
        return e
          ? s.runningInNodeJS()
            ? s.BufferTools.bufferToUint8Array(Buffer.from(e, "base64"))
            : t.decodeWithJS(e)
          : new Uint8Array(0);
      }),
      (t.encodeWithJS = function (e, t) {
        if ((void 0 === t && (t = !0), !e || 0 == e.length)) return "";
        for (var r, n = a, o = new s.StringBuilder(), i = 0, u = e.length; i < u; i += 3)
          i <= u - 3
            ? ((r = (e[i] << 16) | (e[i + 1] << 8) | e[i + 2]),
              o.appendCharCode(n[(r >>> 18) & 63]),
              o.appendCharCode(n[(r >>> 12) & 63]),
              o.appendCharCode(n[(r >>> 6) & 63]),
              o.appendCharCode(n[63 & r]),
              (r = 0))
            : i === u - 2
            ? ((r = (e[i] << 16) | (e[i + 1] << 8)),
              o.appendCharCode(n[(r >>> 18) & 63]),
              o.appendCharCode(n[(r >>> 12) & 63]),
              o.appendCharCode(n[(r >>> 6) & 63]),
              t && o.appendCharCode(61))
            : i === u - 1 &&
              ((r = e[i] << 16),
              o.appendCharCode(n[(r >>> 18) & 63]),
              o.appendCharCode(n[(r >>> 12) & 63]),
              t && (o.appendCharCode(61), o.appendCharCode(61)));
        return o.getOutputString();
      }),
      (t.decodeWithJS = function (e, t) {
        if (!e || 0 == e.length) return new Uint8Array(0);
        var r = e.length % 4;
        if (1 == r) throw new Error("Invalid Base64 string: length % 4 == 1");
        2 == r ? (e += "==") : 3 == r && (e += "="), (t = t || new Uint8Array(e.length));
        for (var n = 0, o = e.length, i = 0; i < o; i += 4) {
          var u =
            (c[e.charCodeAt(i)] << 18) |
            (c[e.charCodeAt(i + 1)] << 12) |
            (c[e.charCodeAt(i + 2)] << 6) |
            c[e.charCodeAt(i + 3)];
          (t[n++] = (u >>> 16) & 255), (t[n++] = (u >>> 8) & 255), (t[n++] = 255 & u);
        }
        return 61 == e.charCodeAt(o - 1) && n--, 61 == e.charCodeAt(o - 2) && n--, t.subarray(0, n);
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (s) {
    var e;
    ((e = (e = s.Encoding || (s.Encoding = {})).BinaryString || (e.BinaryString = {})).encode = function (e) {
      if (null == e) throw new TypeError("BinaryString.encode: undefined or null input received");
      if (0 === e.length) return "";
      for (var t = e.length, r = new s.StringBuilder(), n = 0, o = 1, i = 0; i < t; i += 2) {
        var u = void 0,
          u = i == t - 1 ? e[i] << 8 : (e[i] << 8) | e[i + 1];
        r.appendCharCode((n << (16 - o)) | (u >>> o)),
          (n = u & ((1 << o) - 1)),
          15 === o ? (r.appendCharCode(n), (n = 0), (o = 1)) : (o += 1),
          t - 2 <= i && r.appendCharCode(n << (16 - o));
      }
      return r.appendCharCode(32768 | t % 2), r.getOutputString();
    }),
      (e.decode = function (e) {
        if ("string" != typeof e) throw new TypeError("BinaryString.decode: invalid input type");
        if ("" == e) return new Uint8Array(0);
        for (var t, r = new Uint8Array(3 * e.length), n = 0, o = 0, i = 0, u = 0; u < e.length; u++) {
          var s = e.charCodeAt(u);
          32768 <= s
            ? (32769 == s && n--, (i = 0))
            : ((o =
                0 == i
                  ? s
                  : ((t = (o << i) | (s >>> (15 - i))),
                    (r[n++] = t >>> 8),
                    (r[n++] = 255 & t),
                    s & ((1 << (15 - i)) - 1))),
              15 == i ? (i = 0) : (i += 1));
        }
        return r.subarray(0, n);
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    ((e = (e = e.Encoding || (e.Encoding = {})).CodePoint || (e.CodePoint = {})).encodeFromString = function (
      e,
      t
    ) {
      var r = e.charCodeAt(t);
      if (r < 55296 || 56319 < r) return r;
      t = e.charCodeAt(t + 1);
      if (56320 <= t && t <= 57343) return t - 56320 + ((r - 55296) << 10) + 65536;
      throw new Error(
        "getUnicodeCodePoint: Received a lead surrogate character, char code " +
          r +
          ", followed by " +
          t +
          ", which is not a trailing surrogate character code."
      );
    }),
      (e.decodeToString = function (e) {
        if (e <= 65535) return String.fromCharCode(e);
        if (e <= 1114111)
          return String.fromCharCode(55296 + ((e - 65536) >>> 10), 56320 + ((e - 65536) & 1023));
        throw new Error(
          "getStringFromUnicodeCodePoint: A code point of " + e + " cannot be encoded in UTF-16"
        );
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var n;
    (e = (e = e.Encoding || (e.Encoding = {})).DecimalString || (e.DecimalString = {})),
      (n = [
        "000",
        "001",
        "002",
        "003",
        "004",
        "005",
        "006",
        "007",
        "008",
        "009",
        "010",
        "011",
        "012",
        "013",
        "014",
        "015",
        "016",
        "017",
        "018",
        "019",
        "020",
        "021",
        "022",
        "023",
        "024",
        "025",
        "026",
        "027",
        "028",
        "029",
        "030",
        "031",
        "032",
        "033",
        "034",
        "035",
        "036",
        "037",
        "038",
        "039",
        "040",
        "041",
        "042",
        "043",
        "044",
        "045",
        "046",
        "047",
        "048",
        "049",
        "050",
        "051",
        "052",
        "053",
        "054",
        "055",
        "056",
        "057",
        "058",
        "059",
        "060",
        "061",
        "062",
        "063",
        "064",
        "065",
        "066",
        "067",
        "068",
        "069",
        "070",
        "071",
        "072",
        "073",
        "074",
        "075",
        "076",
        "077",
        "078",
        "079",
        "080",
        "081",
        "082",
        "083",
        "084",
        "085",
        "086",
        "087",
        "088",
        "089",
        "090",
        "091",
        "092",
        "093",
        "094",
        "095",
        "096",
        "097",
        "098",
        "099",
        "100",
        "101",
        "102",
        "103",
        "104",
        "105",
        "106",
        "107",
        "108",
        "109",
        "110",
        "111",
        "112",
        "113",
        "114",
        "115",
        "116",
        "117",
        "118",
        "119",
        "120",
        "121",
        "122",
        "123",
        "124",
        "125",
        "126",
        "127",
        "128",
        "129",
        "130",
        "131",
        "132",
        "133",
        "134",
        "135",
        "136",
        "137",
        "138",
        "139",
        "140",
        "141",
        "142",
        "143",
        "144",
        "145",
        "146",
        "147",
        "148",
        "149",
        "150",
        "151",
        "152",
        "153",
        "154",
        "155",
        "156",
        "157",
        "158",
        "159",
        "160",
        "161",
        "162",
        "163",
        "164",
        "165",
        "166",
        "167",
        "168",
        "169",
        "170",
        "171",
        "172",
        "173",
        "174",
        "175",
        "176",
        "177",
        "178",
        "179",
        "180",
        "181",
        "182",
        "183",
        "184",
        "185",
        "186",
        "187",
        "188",
        "189",
        "190",
        "191",
        "192",
        "193",
        "194",
        "195",
        "196",
        "197",
        "198",
        "199",
        "200",
        "201",
        "202",
        "203",
        "204",
        "205",
        "206",
        "207",
        "208",
        "209",
        "210",
        "211",
        "212",
        "213",
        "214",
        "215",
        "216",
        "217",
        "218",
        "219",
        "220",
        "221",
        "222",
        "223",
        "224",
        "225",
        "226",
        "227",
        "228",
        "229",
        "230",
        "231",
        "232",
        "233",
        "234",
        "235",
        "236",
        "237",
        "238",
        "239",
        "240",
        "241",
        "242",
        "243",
        "244",
        "245",
        "246",
        "247",
        "248",
        "249",
        "250",
        "251",
        "252",
        "253",
        "254",
        "255",
      ]),
      (e.encode = function (e) {
        for (var t = [], r = 0; r < e.length; r++) t.push(n[e[r]]);
        return t.join(" ");
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (e) {
    var t;
    ((e = (t = e.Encoding || (e.Encoding = {})).StorageBinaryString || (t.StorageBinaryString = {})).encode =
      function (e) {
        return t.BinaryString.encode(e).replace(/\0/g, "耂");
      }),
      (e.decode = function (e) {
        return t.BinaryString.decode(e.replace(/\u8002/g, "\0"));
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (a) {
    var i, t, r, n;
    (i = a.Encoding || (a.Encoding = {})),
      ((t = i.UTF8 || (i.UTF8 = {})).encode = function (e) {
        return e && 0 != e.length
          ? a.runningInNodeJS()
            ? a.BufferTools.bufferToUint8Array(Buffer.from(e, "utf8"))
            : t.createNativeTextEncoderAndDecoderIfAvailable()
            ? r.encode(e)
            : t.encodeWithJS(e)
          : new Uint8Array(0);
      }),
      (t.decode = function (e) {
        return e && 0 != e.length
          ? a.runningInNodeJS()
            ? a.BufferTools.uint8ArrayToBuffer(e).toString("utf8")
            : t.createNativeTextEncoderAndDecoderIfAvailable()
            ? n.decode(e)
            : t.decodeWithJS(e)
          : "";
      }),
      (t.encodeWithJS = function (e, t) {
        if (!e || 0 == e.length) return new Uint8Array(0);
        t = t || new Uint8Array(4 * e.length);
        for (var r = 0, n = 0; n < e.length; n++) {
          var o = i.CodePoint.encodeFromString(e, n);
          if (o <= 127) t[r++] = o;
          else if (o <= 2047) (t[r++] = 192 | (o >>> 6)), (t[r++] = 128 | (63 & o));
          else if (o <= 65535)
            (t[r++] = 224 | (o >>> 12)), (t[r++] = 128 | ((o >>> 6) & 63)), (t[r++] = 128 | (63 & o));
          else {
            if (!(o <= 1114111))
              throw new Error(
                "Invalid UTF-16 string: Encountered a character unsupported by UTF-8/16 (RFC 3629)"
              );
            (t[r++] = 240 | (o >>> 18)),
              (t[r++] = 128 | ((o >>> 12) & 63)),
              (t[r++] = 128 | ((o >>> 6) & 63)),
              (t[r++] = 128 | (63 & o)),
              n++;
          }
        }
        return t.subarray(0, r);
      }),
      (t.decodeWithJS = function (e, t, r) {
        if ((void 0 === t && (t = 0), !e || 0 == e.length)) return "";
        void 0 === r && (r = e.length);
        for (var n, o, i = new a.StringBuilder(), u = t, s = r; u < s; ) {
          if ((o = e[u]) >>> 7 == 0) (n = o), (u += 1);
          else if (o >>> 5 == 6) {
            if (r <= u + 1)
              throw new Error(
                "Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + u
              );
            (n = ((31 & o) << 6) | (63 & e[u + 1])), (u += 2);
          } else if (o >>> 4 == 14) {
            if (r <= u + 2)
              throw new Error(
                "Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + u
              );
            (n = ((15 & o) << 12) | ((63 & e[u + 1]) << 6) | (63 & e[u + 2])), (u += 3);
          } else {
            if (o >>> 3 != 30)
              throw new Error(
                "Invalid UTF-8 stream: An invalid lead byte value encountered at position " + u
              );
            if (r <= u + 3)
              throw new Error(
                "Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + u
              );
            (n = ((7 & o) << 18) | ((63 & e[u + 1]) << 12) | ((63 & e[u + 2]) << 6) | (63 & e[u + 3])),
              (u += 4);
          }
          i.appendCodePoint(n);
        }
        return i.getOutputString();
      }),
      (t.createNativeTextEncoderAndDecoderIfAvailable = function () {
        return (
          !!r ||
          ("function" == typeof TextEncoder &&
            ((r = new TextEncoder("utf-8")), (n = new TextDecoder("utf-8")), !0))
        );
      });
  })((LZUTF8 = LZUTF8 || {})),
  (function (o) {
    (o.compress = function (e, t) {
      if ((void 0 === t && (t = {}), null == e))
        throw new TypeError("compress: undefined or null input received");
      var r = o.CompressionCommon.detectCompressionSourceEncoding(e);
      return (
        (t = o.ObjectTools.override({ inputEncoding: r, outputEncoding: "ByteArray" }, t)),
        (e = new o.Compressor().compressBlock(e)),
        o.CompressionCommon.encodeCompressedBytes(e, t.outputEncoding)
      );
    }),
      (o.decompress = function (e, t) {
        if ((void 0 === t && (t = {}), null == e))
          throw new TypeError("decompress: undefined or null input received");
        return (
          (t = o.ObjectTools.override({ inputEncoding: "ByteArray", outputEncoding: "String" }, t)),
          (e = o.CompressionCommon.decodeCompressedBytes(e, t.inputEncoding)),
          (e = new o.Decompressor().decompressBlock(e)),
          o.CompressionCommon.encodeDecompressedBytes(e, t.outputEncoding)
        );
      }),
      (o.compressAsync = function (e, t, r) {
        var n;
        null == r && (r = function () {});
        try {
          n = o.CompressionCommon.detectCompressionSourceEncoding(e);
        } catch (e) {
          return void r(void 0, e);
        }
        (t = o.ObjectTools.override(
          { inputEncoding: n, outputEncoding: "ByteArray", useWebWorker: !0, blockSize: 65536 },
          t
        )),
          o.enqueueImmediate(function () {
            (t.useWebWorker && o.WebWorker.createGlobalWorkerIfNeeded()
              ? o.WebWorker
              : o.AsyncCompressor
            ).compressAsync(e, t, r);
          });
      }),
      (o.decompressAsync = function (e, t, r) {
        var n;
        null == r && (r = function () {}),
          null != e
            ? ((t = o.ObjectTools.override(
                { inputEncoding: "ByteArray", outputEncoding: "String", useWebWorker: !0, blockSize: 65536 },
                t
              )),
              (n = o.BufferTools.convertToUint8ArrayIfNeeded(e)),
              o.EventLoop.enqueueImmediate(function () {
                t.useWebWorker && o.WebWorker.createGlobalWorkerIfNeeded()
                  ? o.WebWorker.decompressAsync(n, t, r)
                  : o.AsyncDecompressor.decompressAsync(e, t, r);
              }))
            : r(void 0, new TypeError("decompressAsync: undefined or null input received"));
      }),
      (o.createCompressionStream = function () {
        return o.AsyncCompressor.createCompressionStream();
      }),
      (o.createDecompressionStream = function () {
        return o.AsyncDecompressor.createDecompressionStream();
      }),
      (o.encodeUTF8 = function (e) {
        return o.Encoding.UTF8.encode(e);
      }),
      (o.decodeUTF8 = function (e) {
        return o.Encoding.UTF8.decode(e);
      }),
      (o.encodeBase64 = function (e) {
        return o.Encoding.Base64.encode(e);
      }),
      (o.decodeBase64 = function (e) {
        return o.Encoding.Base64.decode(e);
      }),
      (o.encodeBinaryString = function (e) {
        return o.Encoding.BinaryString.encode(e);
      }),
      (o.decodeBinaryString = function (e) {
        return o.Encoding.BinaryString.decode(e);
      }),
      (o.encodeStorageBinaryString = function (e) {
        return o.Encoding.StorageBinaryString.encode(e);
      }),
      (o.decodeStorageBinaryString = function (e) {
        return o.Encoding.StorageBinaryString.decode(e);
      });
  })((LZUTF8 = LZUTF8 || {}));
