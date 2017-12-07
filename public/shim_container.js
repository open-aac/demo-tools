(function() {
  var triggers = [];
  var reset = function() {
    triggers = [];
    var target_list = document.querySelectorAll('.target');
    for(var idx = 0; idx < target_list.length; idx++) {
      target_list[idx].parentNode.removeChild(target_list[idx]);
    }
    targets = {};
    target_ids = [];
    source = null;
    last_target_event = {};
    event_type_index = 0;
    scanning = null;
    duration = 0;
  };
  var deliver = function(target, msg, filter) {
    document.getElementById('last_sent_message').innerHTML = JSON.stringify(msg, null, 4);
    target.postMessage(msg, filter);
  };
  var trigger = function(opts) { 
    for(var idx = 0; idx < triggers.length; idx++) {
      if(triggers[idx] && triggers[idx].call) {
        triggers[idx].call(this, opts);
      }
    }
    if(opts.event.target.classList.contains('target') && opts.event.target.callback_id && opts.type == 'select') {
      deliver(source, {
        aac_shim: true,
        callback_id: opts.event.target.callback_id,
        type: opts.type,
        id: opts.event.target.target_id
      }, '*');
    }
  };
  var targets = {};
  var target_ids = [];
  var source = null;
  var overlay = document.getElementById('overlay');
  var last_target_event = {};
  var event_type_index = 0;
  // Note that this demo is assuming there will only ever be one session at a time
  // and is ignoring the session_id parameter. Depending on the AAC system and its
  // implementation this may or may not be a valid assumption.
  window.addEventListener('message', function(event) {
    if(event && event.data && event.data.aac_shim) {
      console.log("message passed:", event.data);
      document.getElementById('last_received_message').innerHTML = JSON.stringify(event.data, null, 4);
      if(event.data.action == 'status') {
        source = event.source;
        var res = {};
        try {
          var code = JSON.parse(document.getElementById('codes').value);
          for(var key in code) {
            res[key] = code[key];
          }
        } catch(e) { }
        res.aac_shim = true;
        res.status = 'ready';
        res.callback_id = event.data.callback_id;
        deliver(event.source, res, '*');
      } else if(event.data.action == 'listen') {
        triggers.push(function(opts) {
          var types = ['click', 'touch', 'gazedwell', 'scanselect'];
          if(opts.type == 'hover' || opts.type == 'over') {
            types = ['mousemove', null, 'gazelinger', null];
            opts.type = 'over';
          } else {
            opts.type = 'select';
          }
          var type = opts.force_type || types[event_type_index];
          var rect = overlay.getBoundingClientRect();
          if(type && opts.event.clientX >= rect.left && opts.event.clientX <= rect.right && opts.event.clientY >= rect.top && opts.event.clientY <= rect.bottom) {              
            if(opts.event.preventDefault) { opts.event.preventDefault(); }
            deliver(event.source, {
              aac_shim: true,
              callback_id: event.data.callback_id,
              aac_type: opts.type,
              type: type,
              x_percent: (opts.event.clientX - rect.left) / rect.width,
              y_percent: (opts.event.clientY - rect.top) / rect.height
            }, '*');
          }
        });
      } else if(event.data.action == 'add_target') {
        var rect = overlay.getBoundingClientRect();
        var target = document.createElement('div');
        target.classList.add('target');
        target.id = 'target_' + event.data.target.id;
        target.style = 'position: absolute; width: ' + (event.data.target.width_percent * rect.width) + '; height: ' + (event.data.target.height_percent * rect.height) + '; left: ' + (rect.left + (event.data.target.left_percent * rect.width)) + '; top: ' + ((document.body.scrollTop || document.scrollTop || 0) + rect.top + (event.data.target.top_percent * rect.height)) + ';'
        target.callback_id = event.data.callback_id;
        target.target_id = event.data.target.id;
        target.prompt = event.data.target.prompt;
        target.addEventListener('click', function(event) {
          trigger({ event: event, type: 'select' });
        });
        target.addEventListener('mousemove', function(event) {
          trigger({ event: event, type: 'hover' });
        });
        document.body.appendChild(target);
        targets[event.data.target.id] = target;
        target_ids.push(event.data.target.id);
        deliver(event.source, {aac_shim: true, callback_id: event.data.callback_id, id: event.data.target.id}, '*');
      } else if(event.data.action == 'clear_target') {
        if(targets[event.data.id]) {
          targets[event.data.id].parentNode.removeChild(targets[event.data.id]);
          var new_list = [];
          for(var idx = 0; idx < target_ids.length; idx++) {
            if(target_ids[idx] != event.data.id) { new_list.push(target_ids[idx]); }
          }
          target_ids = new_list;
          delete targets[event.data.id];
        }
      } else if(event.data.action == 'clear_targets') {
        for(var idx in targets) {
          var target = targets[idx];
          if(target) {
            target.parentNode.removeChild(target);
          }
        }
        targets = {};
        target_ids = [];
        deliver(event.source, {aac_shim: true, callback_id: event.data.callback_id}, '*');
      } else if(event.data.action == 'add_text') {
        if(window.speechSynthesis) {
          var utterance = new window.SpeechSynthesisUtterance();
          utterance.text = event.data.text;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
        sentence.push({text: event.data.text, image: event.data.image_url || 'https://s3.amazonaws.com/opensymbols/libraries/mulberry/paper.svg'});
        update_sentence();
        deliver(event.source, {aac_shim: true, added: true, callback_id: event.data.callback_id}, '*')
      } else if(event.data.action == 'speak_text') {
        var spoken = false;
        if(window.speechSynthesis) {
          var utterance = new window.SpeechSynthesisUtterance();
          utterance.text = event.data.text;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          spoken = true;
        }
        deliver(event.source, {aac_shim: true, spoken: true, callback_id: event.data.callback_id}, '*')
      }
    }
  });
  
  var sentence = [];
  var update_sentence = function() {
    var sentence_dom = document.getElementById('sentence');
    var placeholder_dom = document.getElementById('placeholder');
    // add to the DOM
    if(sentence.length > 0) {
      if(placeholder_dom) { placeholder_dom.style.display = 'none'; }
      if(sentence_dom) { sentence_dom.style.display = 'block'; }
      sentence_dom.innerHTML = '';
      for(var idx = 0; idx < sentence.length; idx++) {
        var utterance = sentence[idx];
        var dom = document.createElement('div');
        dom.classList.add('utterance');
        var img = document.createElement('img');
        img.src = utterance.image;
        dom.appendChild(img);
        var text = document.createElement('div');
        text.innerText = utterance.text;
        dom.appendChild(text);
        sentence_dom.appendChild(dom);
      }
    } else {
      if(placeholder_dom) { placeholder_dom.style.display = 'block'; }
      if(sentence_dom) { sentence_dom.style.display = 'none'; }
    }
  };

  var scanning = null;
  var duration = 0;
  var next_target = function() {
    if(!scanning || duration >= 20) {
      var elems = document.getElementsByClassName('target');
      for(var idx = 0; idx < elems.length; idx++) {
        elems[idx].classList.remove('highlighted');
      }
    }
    if(scanning && duration >= 20) {
      if(scanning.index === undefined) { 
        scanning.index = 0; 
      } else {
        scanning.index++;
      }
      if(scanning.index >= target_ids.length) {
        scanning.index = 0;
      }
      var target = targets[target_ids[scanning.index]];
      if(target) {
        target.classList.add('highlighted');
        var rect = target.getBoundingClientRect();
        trigger({ event: {
          target: target, 
          clientX: rect.left + (rect.width / 2),
          clientY: rect.top + (rect.height / 2)
        }, type: 'hover', force_type: 'scanover' });
        if(window.speechSynthesis) {
          var u = new window.SpeechSynthesisUtterance(target.prompt || "no prompt defined");
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      }
      duration = 0;
    } else if(scanning) {
      duration++;
    } else {
      duration = 0;
    }
  };
  setInterval(next_target, 100);
  document.getElementById('scanning').addEventListener('change', function(event) {
    scanning = event.target.checked ? {} : null;
  });
  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 13 && scanning) {
      event.preventDefault();
      var target = targets[target_ids[scanning.index]];
      if(target) {
        var rect = target.getBoundingClientRect();
        trigger({ event: {
          target: target,
          clientX: rect.left + (rect.width / 2),
          clientY: rect.top + (rect.height / 2)
        }, type: 'select', force_type: 'scanselect'});
      }
      scanning = {}
      // select!
    } else if(event.keyCode == 32) {
      event.preventDefault();
      duration = 20;
      next_target();
    }
  });
  document.addEventListener('click', function(event) {
    if(event.target.classList.contains('event_type')) {
      event.preventDefault();
      var list = document.getElementsByClassName('event_type');
      for(var idx = 0; idx < list.length; idx++) {
        list[idx].classList.remove('selected');
      }
      event.target.classList.add('selected');
      if(event.target.rel == '3' && document.getElementById('scanning').classList.contains('auto')) {
        scanning = {};
        alert('Hit the spacebar to advance to the next option, and return/enter to select');
      } else if(event.target.rel != '3') {
        scanning = false;
      }
      event_type_index = parseInt(event.target.rel) || 0;
    } else if(event.target.classList.contains('demo_type')) {
      event.preventDefault();
      document.getElementById('demos').setAttribute('rel', event.target.getAttribute('rel'));
      localStorage.last_demo = event.target.getAttribute('rel');
      load_demo();
    } else if(event.target.classList.contains('clear')) {
      sentence = [];
      update_sentence();
    } else {
      var elem = event.target;
      while(elem && elem.id != 'sentence_box') {
        elem = elem.parentNode;
      }
      if(elem && elem.id == 'sentence_box') {
        var text = sentence.map(function(u) { return u.text; }).join(' ');
        if(window.speechSynthesis) {
          var utterance = new window.SpeechSynthesisUtterance();
          utterance.text = text;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  });
  document.getElementById('load_url').addEventListener('click', function(event) {
    reset();
    if(!document.getElementById('url').value) {
      document.getElementById('url').value = "./demo_frame.html";
    }
    localStorage.last_tested_url = document.getElementById('url').value;
    localStorage.last_codes = document.getElementById('codes').value;
    document.getElementById('frame').src = document.getElementById('url').value;
  });
  overlay.addEventListener('click', function(event) {
    trigger({ event: event, type: 'select' });
  });
  overlay.addEventListener('mousemove', function(event) {
    trigger({ event: event, type: 'hover' });
  });
  var load_demo = function() {
    reset();
    var current_demo = document.getElementById('demos').getAttribute('rel');
    if(!current_demo) {
      current_demo = document.querySelectorAll('.demo_type,.selected')[0].getAttribute('rel');
    }
    if(current_demo == 'calc') {
      document.getElementById('url').value = "calc/launch";
    } else {
      document.getElementById('url').value = "tarheel/launch";
      document.getElementById('codes').value = JSON.stringify({code: "funny-people"});
    }

    var list = document.getElementsByClassName('demo_type');
    for(var idx = 0; idx < list.length; idx++) {
      if(list[idx].getAttribute('rel') == current_demo) {
        list[idx].classList.add('selected');
      } else {
        list[idx].classList.remove('selected');
      }
    }

    document.getElementById('frame').src = document.getElementById('url').value;
  };
  if(document.getElementById('demos')) {
    reset();
    var current_demo = localStorage.last_demo;
    if(current_demo) {
      document.getElementById('demos').setAttribute('rel', current_demo);
    }
    load_demo();
  } else if(localStorage.last_tested_url) {
    reset();
    document.getElementById('url').value = localStorage.last_tested_url;
    document.getElementById('codes').value = localStorage.last_codes || '';
    document.getElementById('frame').src = document.getElementById('url').value;
  }
})();