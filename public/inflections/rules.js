var matches_rule = function(rule, buttons, do_debug) {
  if(rule.id == 'xxx' && do_debug) { debugger }
  var history_idx = buttons.length - 1;
  var valid = true;
  var condenses = [];
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
        if(check.condense) {
          condenses.push(history_idx);
        }
        history_idx--;
      } else if(!check.optional) {
        valid = false;
      }
    }
  }
  if(valid && condenses.length > 0) {
    return {condense_items: condenses};
  }
  return !!valid;
}
var lookup = function(prior_txt, word_string, do_debug) {
  // Rule checking is greedy, finding the first matching rule for each type
  var found_types = {};
  var matching_rules = [];
  var parts = prior_txt.split(/\s+/);
  var prior_buttons = [];
  parts.forEach(function(str) {
    if(str) {
      var wrd = words.find(function(w) { return w.word == str; });
      prior_buttons.push(wrd || {
        word: str
      });  
    }
  });
  var found_words = words.filter(function(w) { return w.word == word_string; });
  rules.forEach(function(rule) {
    if(prior_buttons.length == 0) {
      var matching_replacement = null;
      if(rule.type == 'override') {
        matching_replacement = rule.overrides && rule.overrides[word_string];
      } else if(found_words.find(function(w) { return w.types.indexOf(rule.type) != -1; })) {
        var word = found_words.find(function(w) { return w.types.indexOf(rule.type) != -1; })
        if(rule.inflection && word && word.inflections) {
          word.types.forEach(function(t) { 
            matching_replacement = matching_replacement || word.inflections[rule.inflection];
          });
        }
      }
      if(matching_replacement) {
        var r = Object.assign({}, rule);
        var pre = [];
        r.lookback.forEach(function(l) {
          var pre_word = null;
          if(l.words) {
            pre_word = l.words[Math.floor(Math.random() * l.words.length)];
          } else if(l.type) {
            var type_words = words.filter(function(w) { return w.types[0] == key; });
            pre_word = type_words[Math.floor(Math.random() * type_words.length)];
          }
          if(pre_word && (!l.optional || Math.random() > 0.5)) {
            pre.push(pre_word);
          }
        });
        r.replacement = matching_replacement;
        if(pre.length) {
          r.replacement = pre.join(' ') + ' ' + r.replacement;
        }
        matching_rules.push(r);
        found_types[rule.type] = true;  
      }
    } else if(!found_types[rule.type] || rule.type == 'override') {
      var matches = matches_rule(rule, prior_buttons, do_debug);
      if(matches) {
        if(matches.condense_items) {
          rule = Object.assign({}, rule);
          rule.condense_items = matches.condense_items;
        }
        matching_rules.push(rule);
        found_types[rule.type] = true;
      }
    }
  });
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
            inflections[key] = inflections[key] || {type: 'override', word: rule.overrides[key], id: rule.id, condense_items: rule.condense_items};
          }
        } else {
          inflections[rule.type] = rule;
        }
      });
      var replacement = null;
      if(inflections[found_word.word] && inflections[found_word.word].word) {
        replacement = inflections[found_word.word].word;
        result_word.replacement = replacement;
        result_word.condense_items = inflections[found_word.word].condense_items;
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
          result_word.condense_items = replacement_rule.condense_items;
          result_word.rule_id = replacement_rule.id;
        }
      }
    });
  }
  return res;
}
