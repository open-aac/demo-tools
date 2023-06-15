var matches_rule = function(rule, buttons, do_debug) {
  if(rule.id == 'xxx' && do_debug) { debugger }
  var history_idx = buttons.length - 1;
  var valid = true;
  for(var idx = rule.lookback.length - 1; idx >= 0 && valid; idx--) {
    var item = buttons[history_idx]
    var check = rule.lookback[idx];
    var pre_check = rule.lookback[idx - 1]
    if(typeof(check) == 'string') {
      if(check.match(/^\(/)) {
        check = {type: check.replace(/\(|\)/g, '')};
      } else if(check.match(/^\[/)) {
        check = {words: check.replace(/^\[/, '').replace(/\[$/, '').split(/|/).map(function(w) { return w.replace(/^\s+/, '').replace(/\s+$/, ''); })};
      } else {
        check = {words: [check]};
      }
    }
    if(!item) { 
      if(!check.optional) {
        valid = false;
      }
    } else {
      var label = item.word.toLowerCase();
      var matching = false;
      var pre_matching = false;
      if(check.words) {
        if(check.words.indexOf(label) != -1) {
          matching = true;
        }
      } else if(check.type) {
        if((item.types || []).indexOf(check.type) != -1) {
          matching = true;
        }
      }
      if(matching && pre_check) {
        if(pre_check.words) {
          if(pre_check.words.indexOf(label) != -1) {
            pre_matching = true;
          }
        } else if(pre_check.type) {
          if((item.types || []).indexOf(pre_check.type) != -1) {
            pre_matching = true;
          }
        }
      }
      if(matching) {
        if(check.optional && pre_matching && !pre_check.optional) {
          matching = false
        } else if(check.match) {
          if(!label.match(check.match)) {
            matching = false;
          }
        }
        if(check.non_match) {
          if(label.match(check.non_match)) {
            matching = false;
          }
        }  
      }
      if(matching) {
        history_idx--;
      } else if(!check.optional) {
        valid = false;
      }
    }
  }
  return !!valid;
}
var lookup = function(txt, word_string, do_debug) {
  // Rule checking is greedy, finding the first matching rule for each type
  var found_types = {};
  var matching_rules = [];
  var parts = txt.split(/\s+/);
  var buttons = [];
  parts.forEach(function(str) {
    var wrd = words.find(function(w) { return w.word == str; });
    buttons.push(wrd || {
      word: str
    });
  });
  rules.forEach(function(rule) {
    if(!found_types[rule.type] || rule.type == 'override') {
      if(matches_rule(rule, buttons, do_debug)) {
        matching_rules.push(rule);
        found_types[rule.type] = true;
      }
    }
  });
  var found_words = words.filter(function(w) { return w.word == word_string; });
  var res = {};
  if(!word_string) {
    for(var key in found_types) {
      if(key != 'override') {
        var type_words = words.filter(function(w) { return w.types[0] == key; });
        found_words = found_words.concat(type_words.sort(function(a, b) { return Math.random() - 0.5; }).slice(0, 2));
      }
    }
  }
  res.words = [];
  res.rules = matching_rules;
  if(found_words.length > 0) {
    found_words.forEach(function(found_word) {
      var result_word = Object.assign({}, found_word);
      res.words.push(result_word)
      var inflections = {};
      matching_rules.forEach(function(rule) {
        if(rule.type == 'override') {
          for(var key in rule.overrides) {
            inflections[key] = inflections[key] || {type: 'override', word: rule.overrides[key], id: rule.id};
          }
        } else {
          inflections[rule.type] = rule;
        }
      });
      var replacement = null;
      if(inflections[found_word.word] && inflections[found_word.word].word) {
        replacement = inflections[found_word.word].word;
        result_word.replacement = replacement;
        result_word.rule_id = inflections[found_word.word].id;
      } else {
        var replacement_rule = null;
        found_word.types.forEach(function(t) { 
          if(inflections[t]) {
            replacement_rule = replacement_rule || inflections[t];
          }
        });
        if(replacement_rule) {
          var replacement = (found_word.inflections || {})[replacement_rule.inflection] || found_word.word;
          result_word.replacement = replacement;
          result_word.rule_type = replacement_rule.inflection;
          result_word.rule_id = replacement_rule.id;
        }
      }
    });
  }
  return res;
}
