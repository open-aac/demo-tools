// TODO: 
// - Fix cursor mode
// - UI for choosing cursor image

var weblinger = {};
(function() {
  var spinner_uri = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='margin:auto;background:%23fff;display:block;' width='200px' height='200px' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'%3E%3Ccircle cx='50' cy='50' r='32' stroke-width='8' stroke='%2399e7ff' stroke-dasharray='50.26548245743669 50.26548245743669' fill='none' stroke-linecap='round' transform='rotate(346.857 50.0001 50.0001)'%3E%3CanimateTransform attributeName='transform' type='rotate' dur='1.2987012987012987s' repeatCount='indefinite' keyTimes='0;1' values='0 50 50;360 50 50'%3E%3C/animateTransform%3E%3C/circle%3E%3Ccircle cx='50' cy='50' r='23' stroke-width='8' stroke='%23ff5151' stroke-dasharray='36.12831551628262 36.12831551628262' stroke-dashoffset='36.12831551628262' fill='none' stroke-linecap='round' transform='rotate(-346.857 50.0001 50.0001)'%3E%3CanimateTransform attributeName='transform' type='rotate' dur='1.2987012987012987s' repeatCount='indefinite' keyTimes='0;1' values='0 50 50;-360 50 50'%3E%3C/animateTransform%3E%3C/circle%3E%3C/svg%3E";
  var gaze_history = [];
  var tilt_history = [];
  var stable_tilt_history = [];
  var mid_tilt_history = [];
  var expr_history = [];
  var log = function() {
    if(weblinger.debug) {
      console.log.apply(this, arguments);
    }
  };
  var default_settings = {
    source: 'head',
    calibration: 'default',
    mode: 'pointer',
    cursor: 'red_circle',
    selection_type: 'linger',
    selection_action: 'click',
    linger_duration: 1000,
    linger_type: 'auto',
    target: 'tabbable',
    target_highlight: 'overlay'
  };
  weblinger._config = {};
  weblinger._state = {};
  weblinger.state = {
    active: false,
    status: 'uninitialized'
  };
  var listeners = {};
  weblinger.start = function(opts) {
    if(opts.source != 'cursor') {
      overlay("Initializing...");
    }
    weblinger.state.status = 'initializing';
    
    if(weblinger._state.active) {
      return weblinger.stop().then(function() {
        return weblinger.start(opts);
      });
    }
    weblinger.state.active = true;
    return new Promise(function(resolve, reject) {
      weblinger._config = Object.assign(default_settings, opts || {});
      if(weblinger._config.event_callback) {
        weblinger._config.callback_id = weblinger._config.callback_id || (Math.random() + "." + (new Date()).getTime());
        if(listeners[weblinger._config.callback_id]) {
          listeners[weblinger._config.callback_id]({type: 'stop'});
        }
        listeners[weblinger._config.callback_id] = weblinger._config.event_callback;
        listeners[weblinger._config.callback_id]({type: 'start'})
      }
      var fully_started = function() {
        weblinger.state.status = 'ready';
        weblinger._state.active = true;
        var video = (weblinger._assert_video.content || {}).video;
        for(var id in listeners) {
          listeners[id]({
            type: 'ready',
            source_video: video
          });
        }  
        resolve();
      };
      var ready_for_calibration = function() {
        if(weblinger._config.calibration instanceof Function) {
          weblinger._config.calibration(weblinger._config).then(function() {
            fully_started();
          }, function(err) {
            weblinger.state.status = 'calibration_error';
            weblinger.state.error = err;
            reject(err);
          });
        } else {
          weblinger.calibrate().then(function() {
            fully_started();
          });
        }
      };
      // These are big libraries, so we don't 
      // include them until they are needed
      var load_head = false;
      if(weblinger._config.selection_type == 'expression') {
        load_head = true;
      }
      if(weblinger._config.source == 'gaze') {
        weblinger.state.tracking = 'gaze';
        var check_for_gazer = function() {
          if(window.webgazer) {
            start_webgazer(ready_for_calibration);
          } else {
            setTimeout(check_for_gazer, 100);
          }
        };
        if(window.webgazer) {
          check_for_gazer();
        } else {
          add_script(weblinger._config.webgazer_source || "lib/webgazer.js/webgazer.js");
          check_for_gazer();
        }
      } else if(weblinger._config.source == 'cursor') {
        weblinger.state.tracking = 'cursor';
        overlay(null);
        fully_started();
        // not much to set up or calibrate
      } else { // default is 'head'
        weblinger._config.source = 'head';
        weblinger.state.tracking = 'head';
        load_head = true;
      }

      if(load_head) {
        var check_for_weboji = function() {
          if(window.JEEFACETRANSFERAPI && window.JEEFACETRANSFERAPINNC) {
            start_weboji(function() {
              if(weblinger._config.source == 'head') {
                ready_for_calibration();
              }
            });
          } else {
            setTimeout(check_for_weboji, 100);
          }
        };
        if(window.JEEFACETRANSFERAPI && window.JEEFACETRANSFERAPINNC) {
          check_for_weboji();
        } else {
          add_script(weblinger._config.weboji_source || "lib/jeelizWeboji/jeelizFaceTransfer.js");
          add_script(weblinger._config.weboji_nnc_source || "lib/jeelizWeboji/jeelizFaceTransferNNC.json.js");
          check_for_weboji();
        }
      }
      opts.mode == 'pointer'; // default
      opts.mode == 'joystick';
      opts.cursor == 'red_circle'; // default
      opts.cursor == 'dot';
      opts.cursor == 'image_url';
      if(weblinger._cursor_element) {
        weblinger._cursor_element.parentNode.removeChild(weblinger._cursor_element);
      }
      var cursor = document.createElement('div');
      cursor.id = 'weblinger_cursor';
      var generate_cursor = function(image) {
        if(image == 'red_circle') {
          cursor.style.width = '20px';
          cursor.style.height = '20px';
          cursor.style.border = '2px solid #fff';
          cursor.style.boxShadow = '0 0 3px #000';
          cursor.style.borderRadius = '20px';
          cursor.style.background = 'rgba(200, 0, 0, 0.8)';
          weblinger._config.cursor_offset_x = 12;
          weblinger._config.cursor_offset_y = 12;
        } else if(image == 'dot') {

        } else if(image) {
          image.width;
          image.height;
          weblinger._config.cursor_offset_x = weblinger._config.cursor_offset_x || (image.width / 2);
          weblinger._config.cursor_offset_y = weblinger._config.cursor_offset_y || (image.height / 2);;
          // center cursor on the image
        } else {
          cursor.style.display = 'none';
        }
      };
      weblinger._config.cursor = weblinger._config.cursor || 'red_circle';
      if(weblinger._config.cursor == 'red_circle' || weblinger._config.cursor == 'dot')  {
        generate_cursor(weblinger._config.cursor)  ;
      } else {
        var image = new Image();
        image.src = weblinger._config.cursor;
        image.onload = function() {
          generate_cursor(image);
        };
        image.onerror = function() {
          generate_cursor('red_circle');
        }
      }
      cursor.style.position = 'fixed';
      cursor.style.zIndex = 999999;
      cursor.style.pointerEvents = 'none';
      cursor.style.transition = "left 0.1s, top 0.1s";
      cursor.style.left = '-1000px';
      document.body.appendChild(cursor);
      weblinger._cursor_element = cursor;

      opts.selection_type == 'linger'; // default
      opts.selection_type == 'expression';
      opts.selection_type == [13]; // keycodes
      opts.selection_type == 'none';
      opts.selection_expressions == ['eyebrows', 'smile', 'mouth-open'];
      opts.selection_action == 'click'; // default
      opts.selection_action == function() { };
      opts.linger_duration == 1000; //ms
      opts.target_highlight == 'overlay'; // default
      opts.target_highlight == '.css_class';
      opts.scroll == 'none'; // default
    });
    // returns promise  
  };

  weblinger.stop = function(opts) {
    opts = opts || {};
    var full_stop = opts.teardown;
    if(weblinger._assert_video.content) {
      if(weblinger._assert_video.content.video) {
        weblinger._assert_video.content.video.pause();
      }
      if(full_stop) {
        if(weblinger._assert_video.content.stream) {
          var track = weblinger._assert_video.content.stream.getVideoTracks()[0];
          track.stop();
          if(weblinger._assert_video.content.video) {
            weblinger._assert_video.content.video.pause();
          }
        }
        weblinger._assert_video.content = {};  
      }
    }
    return new Promise(function(resolve, reject) {
      if(weblinger._state.gazer) {
        if(window.webgazer) {
          if(full_stop) {
            window.webgazer.end();
            weblinger._state.gazer_paused = false;  
          } else {
            window.webgazer.pause();
            weblinger._state.gazer_paused = true;  
          }
        }
        weblinger._state.gazer = false;
      }
      if(weblinger._state.weboji) {
        if(weblinger.faceapi) {
          if(full_stop && false) {
            weblinger.faceapi.destroy();
            weblinger._state.weboji_paused = false;
          } else {
            weblinger.faceapi.switch_sleep(true);
            weblinger._state.weboji_paused = true;
          }
        }
        weblinger._state.weboji = false;
      }
      if(weblinger._cursor_element) {
        weblinger._cursor_element.style.display = 'none';
      }
      weblinger._state.active = false;
      weblinger._config = {};
      weblinger.state.status = 'stopped';
      weblinger.state.tracking = null;
      weblinger.state.active = false;
      if(opts.callback_id) {
        if(listeners[opts.callback_id]) {
          listeners[opts.callback_id]({type: 'stop'});
          delete listeners[opts.callback_id]
        }
      } else {
        for(var id in listeners) {
          listeners[id]({type: 'stop'});
          delete listeners[id]
        }
      }
      // assume cool-down will be necessary
      setTimeout(function() {
        resolve();
      }, 200);
    }); 
  };
  document.addEventListener('keydown', function(e) {
    if(((weblinger._config.selection_type || {}).keycodes || []).indexOf(e.keyCode) != -1)  {
      e.preventDefault();
      weblinger._notify_select('keyselect', {trigger: 'keydown'});
    }
  });
  document.addEventListener('mousemove', function(e) {
    // TODO: debounce, these will be much noisier than other types
    if(weblinger._config.source == 'cursor' && weblinger._state.active) {
      weblinger._notify_linger(e.clientX, e.clientY, 'cursor');
    }
  });
  document.addEventListener('click', function(e) {
    // if(weblinger.faceapi.angles && weblinger.faceapi.position) {
    //   var opp = e.clientX - (window.screen.width / 2);
    //   var angle = weblinger.faceapi.angles[1];
    //   var adj_approx = 1 - weblinger.faceapi.position[2];
    //   var adj = opp / Math.tan(angle);
    //   console.log(angle, adj_approx, adj, adj/adj_approx);
    // }
    // window.webgazer.moveListener(e);
    // window.webgazer.clickListener(e);
  });
  weblinger._notify_linger = function(clientX, clientY, source) {
    weblinger._last_linger = {x: clientX, y: clientY, source: source, timestamp: (new Date()).getTime()};
    if(weblinger.state.calibrating || !weblinger._state.active) { return; }
    // move the cursor here
    var cursor_width = 15;
    // TODO: if the cursor sticks below/above the fold
    // and scroll is enabled, start scrolling slowly
    var targets = find_dwell_target(clientX, clientY);
    weblinger._cursor_element.style.left = Math.round(Math.min(window.innerWidth - cursor_width, Math.max(0 - cursor_width + 5, clientX - (weblinger._config.cursor_offset_x || 0)))) + "px";
    weblinger._cursor_element.style.top = Math.round(Math.min(window.innerHeight - cursor_width, Math.max(0 - cursor_width + 5, clientY - (weblinger._config.cursor_offset_y || 0)))) + "px";
    var target = targets.target;
    var raw_elem = targets.element || document.body;

    // Check if we've been dwelling on the same dwell target
    // and linger selection type
    if(weblinger._config.selection_type == 'linger') {
      var hide_progress = function(clear) {
        weblinger._last_dwell = null;
        if(weblinger._dwell_element) {
          weblinger._dwell_element.style.left = '-1500px';
        }
        if(clear && target) {
          target.dwell_started = null;
          target.dwell_updated = null;
        }
      };
      if(!target) {
        // Clear any assumptions about dwelling on a target
        hide_progress();
        // TODO: Support leeway here if they temporarily get a little off
      } else {
        var now = (new Date()).getTime();
        var update_progress = function(elem) {
          // Initialize or reposition the dwell progress indication
          elem.dwell_started = elem.dwell_started || now;
          elem.dwell_updated = now;
          var pos = {};
          var ref = elem;
          if(elem.width && elem.height && !elem.getBoundingClientRect) {
            // Not an actual DOM element, must be returned by callback
            pos = elem;
            ref = elem.id;
          } else {
            var bounds = elem.getBoundingClientRect();
            pos = {
              x: bounds.left,
              y: bounds.top,
              width: bounds.width,
              height: bounds.height
            };  
          }
          if(pos.width && pos.height) {
            elem.dwell_ref = ref;
            if(weblinger._last_dwell != ref) {
              if(!weblinger._dwell_element) {
                var div = document.createElement('div');
                div.id = 'weblinger_dwell';
                div.style.position = 'relative';
                div.style.position = 'fixed';
                div.style.zIndex = 999998;
                div.style.pointerEvents = 'none';
                document.body.appendChild(div);
                weblinger._dwell_element = div;
              }
              weblinger._dwell_element.style.width = pos.width + 'px';
              weblinger._dwell_element.style.height = pos.height + 'px';
              weblinger._dwell_element.style.left = pos.x + 'px';
              weblinger._dwell_element.style.top = pos.y + 'px';
              weblinger._dwell_element.style.display = 'block';
              weblinger._dwell_element.innerHTML = "";
              var inner = document.createElement('div');
              inner.style.position = 'absolute';
              inner.style.background = 'rgba(161, 167, 255, 0.4)';
              inner.style.border = '2px solid #484ea3';
              inner.style.bottom = '0px';
              inner.style.left = '0px';
              inner.style.right = '0px';
              var pct = 0.0;
              inner.style.top = pos.height * (1 - pct);
              inner.style.transition = "top " + (weblinger._config.linger_duration * (1 - pct) / 1000) + "s ease-out";
              weblinger._dwell_element.appendChild(inner);
              // TODO: for css class option, set style.transitionDuration based on timing
              setTimeout(function() {
                inner.style.top = '0px';
              }, 10);
              // Remove any existing progress and start anew
              // Figure out how much time is left, fill up that much
              // and set the transition time for the rest
            }
            weblinger._last_dwell = ref;
          } else {
            log("BAD TARGET");
            hide_progress();
          }
        };
        if(target.dwell_started) {
          if(target.dwell_timer) {
            clearTimeout(target.dwell_timer);
          }
          if(target.dwell_updated && target.dwell_updated < now  - 500) {
            log("LATE TARGET");
            hide_progress(true);
          }
        }
        if(target) {
          update_progress(target);
        } else {
          log("NO TARGET");
          hide_progress();
        }
        if(target.dwell_started < now - weblinger._config.linger_duration) {
          // - Check if we've been dwelling on the same target
          setTimeout(function()  {
            weblinger._notify_select('dwell', {trigger: 'dwell_complete'});
          }, 10);
          hide_progress(true);
        } else {
          var linger_type = weblinger._config.linger_type;
          if(linger_type == 'auto') {
            linger_type = weblinger._config.mode == 'pointer' ? 'maintain' : 'rest';
          }
          if(linger_type == 'maintain') {
            // - Set a timeout to cancel the dwell if no events
            //   found in the meantime (for constant-event types)
            target.dwell_timer = setTimeout(function() {
              if(target.dwell_updated == now) {
                hide_progress(true);
              }
            }, Math.max(200, weblinger._config.linger_duration / 5));
          } else if(linger_type == 'rest') {
            // - Set a timeout to auto-select if no events
            //   found in the meantime (for joystick-mode types)
            target.dwell_timer = setTimeout(function() {
              if(weblinger._last_dwell == target.dwell_ref) {
                setTimeout(function()  {
                  weblinger._notify_select('dwell', {trigger: 'dwell_timeout'});
                }, 10);   
                hide_progress(true);               
              }
            }, weblinger._config.linger_duration - (now - target.dwell_started));
          }  
        }
      }
    }

    var event_settings = {
      source: 'weblinger',
      trigger: 'mousemove-or-whatever',
      clientX: clientX,
      clientY: clientY
    };
    if(!weblinger.state.calibrating && weblinger._state.active) {
      for(var id in listeners) {
        listeners[id]({type: 'linger', x: clientX, y: clientY, target: target});
      }
      if(window.CustomEvent) {
        var event = new CustomEvent('linger', event_settings);
        raw_elem.dispatchEvent(event);  
      } else {
        var event = document.createEvent('Event');
        event.initEvent('linger', true, true);
        for(var key in event_settings) {
          event[key] = event_settings[key];
        }
        raw_elem.dispatchEvent(event);
      }
    }
  };
  var find_dwell_target = function(clientX, clientY) {
    // Hide any cursors, then check for the activated element
    var restore_cursor = false;
    var restore_dwell = false;
    var cursor_left = null;
    // if(weblinger._cursor_element && weblinger._cursor_element.style.display != 'none') {
    //   cursor_left = weblinger._cursor_element.style.left;
    //   weblinger._cursor_element.style.left = '-1000px';
    //   restore_cursor = true;
    // }
    // if(weblinger._dwell_element && weblinger._dwell_element.style.left != '-1500px') {
    //   restore_dwell = weblinger._dwell_element.style.left;
    //   weblinger._dwell_element.style.left = '-1000px';
    // }
    if(weblinger._config.cursors) {
      weblinger._config.cursors.forEach(function(c) {
        if(c.style.pointerEvents != 'none') {
          c.style.pointerEvents = 'none';
        }
      });
    }
    var elem = document.elementFromPoint(clientX, clientY);
    // if(weblinger._config.cursors) {
    //   weblinger._config.cursors.forEach(function(c) {
    //     if(c.restore_cursor) {
    //       c.style.left = '';
    //     }
    //   });
    // }
    // if(weblinger._dwell_element && restore_dwell) {
    //   weblinger._dwell_element.style.left = restore_dwell;
    // }
    // if(weblinger._cursor_element && restore_cursor) {
    //   weblinger._cursor_element.style.left = cursor_left;
    // }

    var target = null;
    if(weblinger._config.targets instanceof Function) {
      // check with callback for matching target
      target = weblinger._config.targets(elem, clientX, clientY);
    } else if(weblinger._config.targets instanceof Array) {
      // check array of possible targets
      if(elem) {
        var tree = [];
        var e = elem;
        // generate parent tree
        while(e) {
          tree.push(e);
          if(e.parentNode && e.parentNode != e) {
            e = e.parentNode;
          } else {
            e = null;
          }
        }
        // find the earliest target in both the dom and targets list that matches
        weblinger._config.targets.forEach(function(target) {
          if(!target)  {
            var idx = tree.indexOf(target);
            if(idx != -1) {
              target = tree[idx];
            }  
          }
        });
      }
    } else {
      // default 'tabbable'
      target = elem && elem.closest('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    }
    return {target: target, element: elem};
  }
  weblinger._notify_select = function(type, settings) {
    if(!weblinger._state.active || !weblinger._last_linger) {
      return false;
    }
    var clientX = weblinger._last_linger.x;
    var clientY = weblinger._last_linger.y;

    var target = find_dwell_target(clientX, clientY).target;
    if(target) {
      if(weblinger._config.selection_action == 'click') {
        target.click();
      } else if(weblinger._config.selection_action instanceof Function) {
        weblinger._config.selection_action(target, clientX, clientY);
      }
      var event_settings = Object.assign({
        source: 'weblinger',
        trigger: 'mousemove-or-whatever',
        clientX: clientX,
        clientY: clientY
      }, settings || {});
      if(!weblinger.state.calibrating && weblinger._state.active) {
        for(var id in listeners) {
          listeners[id]({type: 'select', x: clientX, y: clientY, target: target});
        }
        if(window.CustomEvent) {
          var event = new CustomEvent(type, event_settings);
          target.dispatchEvent(event);  
        } else {
          var event = document.createEvent('Event');
          event.initEvent(type, true, true);
          for(var key in event_settings) {
            event[key] = event_settings[key];
          }
          target.dispatchEvent(event);
        }  
      }
    }
  };
  // instanceof Function
  weblinger.found_target = function(dom_elem) {

  };
  weblinger._assert_video = function() {
    weblinger._assert_video.content = weblinger._assert_video.content || {};
    if(weblinger._assert_video.pending_promise) {
      return weblinger._assert_video.pending_promise;
    }
    if(weblinger._assert_video.content.stream) {
      var track = weblinger._assert_video.content.stream.getVideoTracks()[0];
      if(track && track.readyState == 'ended') {
        if(weblinger._assert_video.content.video) {
          weblinger._assert_video.content.video.pause();
        }
        weblinger._assert_video.content = {};
      } else {
        if(weblinger._assert_video.content.video) {
          weblinger._assert_video.content.video.play();
        }
      }
    }
    var promise = new Promise(function(resolve, reject) {
      if(weblinger._assert_video.content.canvas) {
        return resolve(weblinger._assert_video.content.canvas);
      }
      var opts = { video: { width: { min: 320, ideal: 640, max: 1920 }, height: { min: 240, ideal: 480, max: 1080 }, facingMode: "user" } };
      navigator.mediaDevices.getUserMedia(opts).then(function(stream) {
        weblinger._assert_video.content.stream = stream;
        var video = document.createElement('video');
        video.srcObject = stream;
        video.style.width = '300px';
        video.setAttribute('playsinline', true);
        video.style.position = 'absolute';
        video.style.left = '-1000px';
        video.style.bottom = '0px';
        document.body.appendChild(video);
        weblinger._assert_video.content.video = video;
        var canvas = weblinger._assert_video.canvas;
        if(!canvas) {
          canvas = document.createElement('canvas');
          canvas.style.width = '300px';
          canvas.style.height = '225px';
          canvas.style.position = 'absolute';
          canvas.style.display = 'none';
          canvas.style.top = 0;
          canvas.style.right = 0;  
          document.body.appendChild(canvas);   
          weblinger._assert_video.canvas = canvas;
        }
        weblinger._assert_video.content.canvas = canvas;
        var context = canvas.getContext('2d');
        // give canvas same dimensions as video element
        var check_video = function() {
          if(video.paused || video.ended) {
            setTimeout(check_video, 500);
          } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            window.requestAnimationFrame(check_video);
          }
        };
        video.onloadedmetadata = function(e) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.play();
          window.requestAnimationFrame(check_video);
          resolve(canvas);
        };     
        video.addEventListener('timeupdate', function() {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.play();
        });
      }, function(err) {
        reject(err);
      });
    });
    weblinger._assert_video.pending_promise = promise;
    promise.then(function() {
      if(weblinger._assert_video.pending_promise == promise) { weblinger._assert_video.pending_promise = null; }
    }, function() {
      if(weblinger._assert_video.pending_promise == promise) { weblinger._assert_video.pending_promise = null; }
    });
    return promise;
  };

  weblinger.calibrate = function() {
    return new Promise(function(resolve, reject) {
      if(weblinger._config.source == 'cursor') {
        return resolve();
      }
      weblinger.state.calibrating = true;
      weblinger.state.status = 'calibrating';
      var calibration_ready = function() {
        setTimeout(function() {
          weblinger._calibrate_element.style.display = 'none';
        }, 2000);
        weblinger._cursor_element.style.display = '';
        delete weblinger.state.calibrating;
        overlay(null);
        resolve();
      };
      var centering = 17;
      if(!weblinger._calibrate_element) {
        var calib = document.createElement('div');
        calib.id = 'weblinger_calibration'
        calib.style.width = '30px';
        calib.style.height = '30px';
        calib.style.border = '2px solid #fff';
        calib.style.boxShadow = '0 0 3px #000';
        calib.style.borderRadius = '30px';
        calib.style.position = 'fixed';
        calib.style.zIndex = 999999;
        calib.style.opacity = 0.0;
        document.body.appendChild(calib);
        calib.style.transition = "left 2s, top 2s, opacity 1s, width 0.5s, height 0.5s, margin-left 0.5s, margin-top 0.5s, background 0.3s";
        weblinger._calibrate_element = calib;
      }
      weblinger._calibrate_element.style.background = 'rgba(50, 105, 168, 0.8)';
      weblinger._calibrate_element.style.left = 'calc(50vw - ' + centering + 'px)';
      weblinger._calibrate_element.style.top = 'calc(50vh - ' + centering + 'px)';
      weblinger._calibrate_element.style.display = 'block';
      weblinger._calibrate_element.style.opacity = 1.0;
      weblinger._cursor_element.style.display = 'none';
      calib = weblinger._calibrate_element;
      if(calib.active && calib.reject_prior) {
        calib.reject_prior();
        calib.active = null;
      }
      var calib_key = Math.random();
      calib.active = calib_key;
      calib.reject_prior = reject;
      var ctr = 0;
      var offsets = [];
      var tilts = [];
      var expressions = [];
      var throb = function() {
        if(calib.active) {
          if(calib.in || calib.moving) {
            calib.in = false;
            calib.style.width = '30px';
            calib.style.marginLeft = '0';
            calib.style.height = '30px';
            calib.style.marginTop = '0';
          } else {
            calib.in = true;
            calib.style.width = '15px';
            calib.style.marginLeft = '7.5px';
            calib.style.height = '15px';
            calib.style.marginTop = '7.5px';
          }  
          setTimeout(throb, 500);
        }
      };
      setTimeout(throb, 500);
      var check_position = function() {
        var now = (new Date()).getTime();
        calib.last_move = calib.last_move || now;
        if(calib.active == calib_key) {
          if(weblinger._config.source == 'gaze') {
            // Check location of the bouncing ball,
            // and use it to train the gaze model
            var bounds = calib.getBoundingClientRect();
            var x = bounds.left + (bounds.width / 2);
            var y = bounds.top + (bounds.height / 2);
            if(calib.moving) {
              ctr = 0;
              if(calib.last_move < now - 50) {
                calib.last_move = now;
                webgazer.recordScreenPosition(x, y, 'move');
                log("calib move", bounds.left, bounds.top);                
              }
            } else {
              ctr++;
              if(ctr > 30) {
                ctr = 0;
                webgazer.recordScreenPosition(x, y, 'click');
                log("calib click", bounds.left, bounds.top);
              }
            }
          } else if(weblinger._config.source == 'head') {
            // Record the current head location, use
            // the list to normalize into position
            // Also try to get a baseline for expressions
            ctr++;
            if(ctr > 30) {
              if(weblinger._last_tilt) {
                tilts.push(weblinger._last_tilt);
              }
              if(weblinger._last_linger && weblinger._last_linger.source == 'head') {
                if(offsets[offsets.length - 1] == weblinger._last_linger) {
                } else if(false) {
                  // TODO: if too much variability, go back on confidence
                } else {
                  // TODO: shrink slightly with each progression
                  offsets.push(weblinger._last_linger);
                  if(weblinger.faceapi.expressions) {
                    expressions.push(Array.from(weblinger.faceapi.expressions));
                  }  
                }
              }
              ctr = 0;
            }
          }
          window.requestAnimationFrame(check_position);  
        }
      };
      setTimeout(check_position, 500);
      if(weblinger._config.source == 'gaze') {
        overlay("Follow the Dot with Your Eyes");
        var sequence = [
          {time: 3000, left: 50, top: 50},
          {left: 5, top: 5},
          {left: 50, top: 5},
          {left: 95, top: 5},
          {left: 5, top: 50},
          {left: 95, top: 50},
          {left: 5, top: 95},
          {left: 50, top: 95},
          {left: 95, top: 95}
        ];
        var delay =  10;
        sequence.forEach(function(item) {
          setTimeout(function() {
            if(calib.active != calib_key) { return}
            calib.moving = true;
            setTimeout(function() { calib.moving = false; }, 2000);
            calib.style.left = 'calc(' + item.left + 'vw - ' + centering + 'px)';
            calib.style.top = 'calc(' + item.top + 'vh - ' + centering + 'px)';
  
          }, delay);
          delay = delay + (item.time || 5000);
        });
        setTimeout(function() {
          if(calib.active != calib_key) { return}
          calib.style.opacity = 0.0;
          calib.active = false;
          calibration_ready();
        }, delay);
      } else if(weblinger._config.source == 'head') {
        weblinger.faceapi.tilt_offset = null;
        overlay("Look Here!");
        var drops =  0;
        var check_offsets = function() {
          if(offsets.length > 5) {
            calib.style.background = 'rgba(83, 168, 50, 0.8)';
          } else if(drops > 5) {
            calib.style.background = 'rgba(168, 50, 50, 0.8)';
          } else {
            calib.style.background = 'rgba(50, 105, 168, 0.8)';
          }
          if(offsets.length < 8) {
            setTimeout(check_offsets, 200);
          } else {
            var avg_x = 0, avg_y = 0;
            offsets.forEach(function(offset) {
              avg_x = avg_x + offset.x;
              avg_y = avg_y + offset.y;
            });
            avg_x = avg_x / offsets.length;
            avg_y = avg_y / offsets.length;
            var dist_x = 0, dist_y = 0;
            offsets.forEach(function(offset) {
              dist_x = dist_x + Math.abs(offset.x - avg_x);
              dist_y = dist_y + Math.abs(offset.y - avg_y);
            });
            dist_x = dist_x / offsets.length * 5;
            dist_y = dist_y / offsets.length * 5;
            var last_far = null;
            var last_ts = null;
            offsets.forEach(function(offset, idx) {
              var diff_x = Math.abs(offset.x - avg_x);
              var diff_y = Math.abs(offset.y - avg_y);
              if(offset.timestamp - (last_ts ||  offset.timestamp) > 1000) {
                last_far = idx;
              } else if(diff_x > dist_x || diff_y > dist_y) {
                last_far = idx;
              }
              last_ts = offset.timestamp;
            });
            if(last_far) {
              drops = drops + offsets.length - last_far - 1;
              offsets = offsets.slice(Math.max(-1, last_far - offsets.length + 1));
            }
            if(offsets.length >= 8) {
              offsets_ready();
            } else {
              setTimeout(check_offsets, 200);
            }
          }
        };
        var offsets_ready = function() {
          var groups = [];
          expressions.forEach(function(expr) {
            expr.forEach(function(val, idx) {
              groups[idx] = groups[idx] || []
              groups[idx].push(val);
            });
          });
          weblinger.faceapi.baseline_expressions = [];
          groups.forEach(function(group, idx) {
            var chopped = group.sort().slice(1, -1);
            var mean = 0;
            chopped.forEach(function(val) { mean = mean + val; });
            weblinger.faceapi.baseline_expressions[idx] = mean / chopped.length;
          });
          var avg_x = 0, avg_y = 0, avg_bank = 0, avg_attitude = 0;
          offsets.forEach(function(offset) {
            avg_x = avg_x + offset.x;
            avg_y = avg_y + offset.y;
          });
          tilts.forEach(function(tilt) {
            avg_bank = avg_bank + tilt.bank;
            avg_attitude = avg_attitude + tilt.attitude;
          });
          if(isNaN(avg_x)) { debugger }
          if(offsets.length == 0) { debugger }
          weblinger.faceapi.tilt_offset = {x: (avg_x / offsets.length) - (window.innerWidth / 2), y: (avg_y / offsets.length) - (window.innerHeight / 2), points: offsets, bank: (avg_bank / tilts.length), attitude: (avg_attitude / tilts.length)};
          calib.style.opacity = 0.0;
          calib.active = false;
          calibration_ready();
        };
        setTimeout(check_offsets, 3000);
      }
    });
  };

  var start_webgazer = function(done) {
    window.applyKalmanFilter = true;
    window.saveDataAcrossSessions = false;
    window.webgazer.showVideo(false);
    window.webgazer.showPredictionPoints(false);
    window.webgazer.showFaceFeedbackBox(false);
    window.webgazer.showFaceOverlay(false);
    window.webgazer.clearData();
    window.webgazer.removeMouseEventListeners();
    var check_for_gazer_in_dom = function() {
      var dot = document.querySelector('#webgazerGazeDot');
      if(dot) {
        window.webgazer.showVideo(false);
        window.webgazer.showPredictionPoints(false);
        window.webgazer.showFaceFeedbackBox(false);
        window.webgazer.showFaceOverlay(false);
        window.webgazer.removeMouseEventListeners();    
        window.webgazer.clearData();
        done();
      } else {
        setTimeout(check_for_gazer_in_dom, 100);
      }
    };
    if(weblinger._state.gazer) {
      done();
      // already running
    } else if(weblinger._state.gazer_paused) {
      // already initialized, but paused
      weblinger._assert_video().then(function(canvas) {        
        window.webgazer.setVideoElementCanvas(canvas);
        window.webgazer.resume();
        done();
      });
    } else {
      weblinger._assert_video().then(function(canvas) {        
        window.webgazer.setVideoElementCanvas(canvas);
        window.webgazer.setGazeListener(function(data, ms) {
          if(data == null) { return; }
          gaze_history = (gaze_history || []).slice(-5);
          gaze_history.push([data.x, data.y]);
          var avg_x = 0, avg_y = 0;
          gaze_history.forEach(function(gaze) {
            avg_x = avg_x + gaze[0];
            avg_y = avg_y + gaze[1];
          })
          avg_x = avg_x / gaze_history.length;
          avg_y = avg_y / gaze_history.length;
          weblinger._notify_linger(avg_x, avg_y, 'gaze');
        });
        window.webgazer.begin(null, canvas);  
      }, function(err) {
        // TODO: handle error getting video
      });
    }
    weblinger._state.gazer = true;
    weblinger._state.gazer_paused = false;
    setTimeout(check_for_gazer_in_dom, 100);
  };

  var l4 = 0.4, l3 = 0.3, l2 = 0.2, l1 = 0.15;
  var tilt_scale = function(tilt, factor) {
    var scale = 0;
    if(tilt > l4/factor) {
      scale = -5;
    } else if(tilt > l3/factor) {
      scale = -3; 
    } else if(tilt > l2/factor) {
      scale = -2;
    } else if(tilt > l1/factor) {
      scale = -1;
    } else if(tilt < -1*l4/factor) {
      scale = 5;
    } else if(tilt < -1*l3/factor) {
      scale = 3;
    } else if(tilt < -1*l2/factor) {
      scale = 2;
    } else if(tilt < -1*l1/factor) {
      scale = 1;
    }
    return scale;
  }

  var poll_weboji = function() {
    if(weblinger._state.weboji && !weblinger._state.weboji_paused && weblinger.faceapi.ready && weblinger.faceapi.is_detected()) {
      var angles = weblinger.faceapi.get_rotationStabilized();
      weblinger.faceapi.angles = angles;
      var heading = angles[2];
      var bank = angles[0];
      var attitude = angles[1];
      // negative bank == tilt up, negative == tilt right
      var tilt_factor = 1.0;
      weblinger._last_tilt = {bank: bank, attitude: attitude};
      weblinger.faceapi.position = weblinger.faceapi.get_positionScale();
      weblinger.faceapi.expressions = weblinger.faceapi.get_morphTargetInfluencesStabilized();
      var adj_x = (1 - weblinger.faceapi.position[2]) * 5000;
      var opp_x = Math.tan(angles[1]) * adj_x;
      var adj_y = (1 - weblinger.faceapi.position[2]) * 5000;
      var opp_y = Math.tan(angles[0]) * adj_y;
      // TODO: once projected, rotate based on angles[2]

      // These measurements assume a top-centered camera
      var x = (window.screen.height / 2) + opp_x;
      var y = opp_y;

      var expr = Array.from(weblinger.faceapi.expressions);
      expr.forEach(function(val, idx) {
        expr[idx] = val - ((weblinger.faceapi.baseline_expressions || [])[idx] || 0);
      })
      var action = null;
      //     0:  smileRight
      //     1:  smileLeft
      //     2:  eyeBrowLeftDown
      //     3:  eyeBrowRightDown
      //     4:  eyeBrowLeftUp
      //     5:  eyeBrowRightUp
      //     6:  mouthOpen
      //     7:  mouthRound
      //     8:  eyeRightClose
      //     9:  eyeLeftClose
      //     10: mouthNasty
      if(expr[0] > 0.3 && expr[1] > 0.3) {
        action = 'smile';
      } else if(expr[0] > 0.3 || expr[1] > 0.3) {
        action = 'smirk';
      } else if(expr[4] > 0.3 || expr[5] > 0.3) {
        action = 'eyebrows';
      } else if(expr[6] > 0.3) {
        action = 'mouth-open';
      } else if(expr[7] > 0.3) {
        action = 'kiss';
      } else if(expr[8] > 0.3 && expr[9] > 0.3) {
        action = 'blink';
      } else if(expr[8] > 0.3 || expr[9] > 0.3) {
        action = 'wink';
      }
      if(action == weblinger.faceapi.last_action && weblinger.faceapi.last_action_at > (new Date()).getTime() - 1000) {
        action = null;
        // debounce 
      }  
      var confirmed_action = null;
      var progressing_action = false;
      if(action) {
        expr_history.push(action);
        var expr_types = {};
        var cutoff = 0;
        ([].concat(expr_history)).reverse().forEach(function(evt, idx) {
          var keys = Object.keys(expr_types).sort();
          if(keys.length == 0) {
            expr_types[evt] = (expr_types[evt] || 0) + 1;
          } else if(keys.length == 1 && expr_types[evt]) {
            expr_types[evt] = (expr_types[evt] || 0) + 1;
          } else if(keys.length == 2 && ['smile,smirk', 'kiss,mouth-open', 'blink,wink'].indexOf(keys.join(',')) != -1) {
            expr_types[evt] = (expr_types[evt] || 0) + 1;
          } else {
            cutoff = cutoff || (-1 * idx);
          }
        });
        if(cutoff) { expr_history = expr_history.slice(cutoff); }
        expr_history = expr_history.slice(-6);
        progressing_action = expr_history.length > 3;
        if(expr_history.length > 3) {
          var max = 0;
          var confirmed_action = null;
          for(var key in expr_types) {
            if(expr_types[key] > max) {
              max = expr_types[key];
              confirmed_action = key;
            }
          }
        }
      }
      if(confirmed_action && !weblinger.state.calibrating && weblinger._state.active) {
        weblinger.faceapi.last_action = confirmed_action;
        weblinger.faceapi.last_action_at = (new Date()).getTime();
        expr_history = [];
        log("ACTION", confirmed_action);
        if(weblinger._config.selection_type == 'expression') {
          // TODO: if the action is wink and we get blink,
          // or action is smirk and we get smile, prolly go with it
          var matched = (weblinger._config.selection_expressions || []).indexOf(confirmed_action) != -1;
          if(confirmed_action == 'smile' && (weblinger._config.selection_expressions || []).indexOf('smirk') != -1) {
            matched = true;
          }
          if(confirmed_action == 'wink' && (weblinger._config.selection_expressions || []).indexOf('blink') != -1) {
            matched = true;
          }
          if(matched) {
            weblinger._notify_select('expression', {expression: confirmed_action});
          }
        }
        if(!weblinger.state.calibrating && weblinger._state.active) {
          for(var id in listeners) {
            listeners[id]({type: 'expression', expression: confirmed_action});
          }
        }
        // opts.selection_type == 'linger'; // default
        // opts.selection_type == 'expression';
        // opts.selection_type == 'none';
        // opts.selection_expressions == ['eyebrows', 'smile', 'mouth-open'];
      }

      var history_size = 10;
      poll_weboji.counter = ((poll_weboji || 0) + 1) % 3;
      while(tilt_history.length > history_size) {
        stable_tilt_history.push(tilt_history.shift());
        if(poll_weboji.counter == 0 && stable_tilt_history.length > history_size) {
          stable_tilt_history.shift();
        }
      }
      while(stable_tilt_history.length > history_size) {
        mid_tilt_history.push(stable_tilt_history.pop());
      }
      mid_tilt_history = mid_tilt_history.slice(history_size);
      // tilt_history = (tilt_history || []).slice(-1 * history_size);
      stable_tilt_history = (stable_tilt_history || []).slice(0, history_size);
      if(!progressing_action || weblinger.state.calibrating) {
        // Don't add to the history if there's
        // an expression is progress, it moves too much
        tilt_history.push([x, y]);
      }
      var ref_x = 0, ref_y = 0;
      stable_tilt_history.forEach(function(gaze) {
        ref_x = ref_x + gaze[0];
        ref_y = ref_y + gaze[1];
      });
      ref_x = ref_x / stable_tilt_history.length;
      ref_y = ref_y / stable_tilt_history.length;
      var avg_dist = 0
      stable_tilt_history.forEach(function(gaze) {
        avg_dist = avg_dist + Math.pow(gaze[0] - ref_x, 2) + Math.pow(gaze[1] - ref_y, 2);
      });
      var min_dist = (Math.pow(window.innerWidth * 0.1, 2) + Math.pow(window.innerHeight * 0.1, 2)) * 3;
      avg_dist = Math.min(avg_dist / stable_tilt_history.length, min_dist) * 4;
      var last_far = null;
      var bads = 0, mid_bads = 0;;
      tilt_history.forEach(function(gaze, idx) {
        var dist = Math.pow(gaze[0] - ref_x, 2) + Math.pow(gaze[1] - ref_y, 2);
        if(dist > avg_dist) {
          last_far = idx;
          bads++;
        } else if(dist > avg_dist / 2) {
          mid_bads++;
        }
      });
      if(last_far && bads > 2 && stable_tilt_history.length > 5) {
        console.log("DROP STABLE", avg_dist, stable_tilt_history.length, last_far, tilt_history.length);
        stable_tilt_history = stable_tilt_history.slice(Math.ceil(-1 * history_size * 0.3)).concat(mid_tilt_history.slice(Math.ceil(-1 * history_size * 0.7))); //.concat([]); //slice(Math.ceil(-1 * tilt_history * 2 / 3));
      } else if(mid_bads > 3) {
        console.log("ADJUST STABLE");
        stable_tilt_history = stable_tilt_history.concat(mid_tilt_history).slice(-1 * history_size);
      }
      var tilts = stable_tilt_history.concat(tilt_history);
      var avg_x = 0, avg_y = 0;
      tilts.forEach(function(gaze) {
        avg_x = avg_x + gaze[0];
        avg_y = avg_y + gaze[1];
      })
      avg_x = avg_x / tilts.length;
      avg_y = avg_y / tilts.length;

      var offset = weblinger.faceapi.tilt_offset || {};
      if(weblinger._config.source == 'head') {
        if(weblinger._config.mode == 'pointer') {
          weblinger._notify_linger(avg_x - (offset.x || 0), avg_y - (offset.y || 0), 'head');
        } else if(weblinger._config.mode == 'joystick') {
          var start_bank = offset.bank || bank;
          var start_attitude = offset.attitude || attitude;
          var vertscale = (weblinger._config.speed || 1) * (window.innerWidth / 250) * tilt_scale(start_bank - bank, 2.0 * tilt_factor);
          var horizscale = (weblinger._config.speed || 1) * (window.innerHeight / 75) * tilt_scale(start_attitude - attitude, 1.0 * tilt_factor);
          console.log("TILT", vertscale, horizscale);
          if(weblinger.joystick_x == null) {
            weblinger.joystick_x = (window.innerWidth / 2);
          }
          if(weblinger.joystick_y == null) {
            weblinger.joystick_y = (window.innerHeight / 2);
          }
          weblinger.joystick_x = Math.min(Math.max(0, weblinger.joystick_x + horizscale), window.innerWidth);
          weblinger.joystick_y = Math.min(Math.max(0, weblinger.joystick_y + vertscale), window.innerHeight);
          weblinger._notify_linger(weblinger.joystick_x, weblinger.joystick_y, 'head');
        }
      }
    }
  };

  var start_weboji = function(done) {
    weblinger.faceapi = window.JEEFACETRANSFERAPI;
    weblinger.faceapi.set_size(640, 480);
    weblinger.faceapi.switch_displayVideo(false);
    start_weboji.poll = start_weboji.poll || function() {
      if(start_weboji.poll.timeout) { 
        clearTimeout(start_weboji.poll.timeout);
      }
      poll_weboji();
      if(weblinger._state.weboji) {
        start_weboji.poll.timeout = setTimeout(start_weboji.poll, weblinger._state.weboji ? 50 : 500);
      }
    };
    if(weblinger._state.weboji) {
      // already running
      start_weboji.poll();
      done();
    } else if(weblinger._state.weboji_paused) {
      // initialized but paused
      debugger
      weblinger._assert_video().then(function(canvas) {        
        weblinger.faceapi.switch_sleep(false);
        weblinger._state.weboji = true;
        weblinger._state.weboji_paused = false;
        start_weboji.poll();
        done();
      });
    } else {
      weblinger.faceapi.onContextLost(function()  {
        debugger
      });
      weblinger._assert_video().then(function(canvas) {        
        weblinger.faceapi.init({
          canvasId: 'face_canvas',
          videoSettings: {
            videoElement: canvas
          },
          NNC: window.JEEFACETRANSFERAPINNC,
          callbackReady: function(code) {
            if(code) { debugger }
            weblinger._state.weboji = true;
            weblinger._state.weboji_paused = false;        
            start_weboji.poll();
            done();
          }
        });
      }, function(err) {
        debugger
      });
      // canvasId: 'jeefacetransferCanvas',

      // assetsParentPath: './assets/3D/',
      // NNCPath: './js/dist/',
  
      // videoSettings: {
      //   videoElement: canvas (different than rendering canvas)
      // },        
    }
  };
  var add_script = function(src) {
    var script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  };
  var overlay = function(str) {
    var overlay = weblinger._overlay_element;
    if(!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'weblinger_overlay';
      overlay.style.position = 'fixed';
      overlay.style.left = 0;
      overlay.style.right = 0;
      overlay.style.top = 0;
      overlay.style.bottom = 0;
      overlay.style.background = 'rgba(255, 255, 255, 0.7)';
      overlay.style.zIndex = 999999;
      overlay.style.opacity = 0.0;
      overlay.style.paddingTop = 'calc(50vh - 20px - 50px)';
      overlay.style.fontSize = '25px';
      overlay.style.fontFamily = 'Arial';
      overlay.style.fontWeight = 'bold';
      overlay.style.textAlign = 'center';
      overlay.style.transition = 'opacity 0.5s';
      weblinger._overlay_element = overlay;
      document.body.appendChild(overlay);
      var text = document.createElement('div');
      text.classList.add('text');
      text.style.background = '#fff';
      text.style.padding = '10px 30px';
      text.style.letterSpacing = '1px';
      text.style.width = '300px';
      text.style.margin = 'auto';
      text.style.boxShadow = '0 0 20px 30px #fff';
      overlay.appendChild(text);
    }
    if(str == "Initializing...") {
      overlay.querySelector('.text').innerHTML = "<img src=\"" + spinner_uri + "\" style=\"width: 30px; padding-right: 10px; vertical-align: middle;\"/>" + str;
    } else {
      overlay.querySelector('.text').innerText = str;
    }
    var key = Math.random();
    overlay.load_key = key;
    if(str) {
      overlay.style.display = 'block';
      setTimeout(function() {
        overlay.style.opacity = 1.0;
      });
    } else {
      overlay.style.opacity = 0.0;
      setTimeout(function() {
        if(overlay.load_key == key) {
          overlay.style.display = 'none';
        }
      }, 1000);
    }
  };
})();