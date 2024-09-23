/*
  Usage:
  await in7ns.load('en', {words_url: "http://...", rules_url: "http://CORS-SAFE-URL"});
  in7ns.lookup("he", null, 'en');
  in7ns.lookup("he", "I like", 'en');
*/
var in7ns = {};
(function() {
  var locale_sets = {};

  // matches_rule and lookup are the two internal methods that
  // encapsulate the inflection rules algorithms. We document
  // them here to make it easier to implement in other languages.

  // matches_rule is called internally by lookup as a reusable
  // way to check whether the current button state matches
  // the requirements for a given rule
  var matches_rule = function(rule, buttons, do_debug) {
    if(rule.id == 'xxx' && do_debug) { debugger }
    // Keep an index for the currently-considered prior button
    var history_idx = buttons.length - 1;
    var valid = true;
    var condenses = [];
    // Working backwards, iterate through all the lookback rules
    // one at a time
    for(var idx = rule.lookback.length - 1; idx >= 0 && valid; idx--) {
      // Retrieve the current prior button, current check, and check before the current check 
      var item = buttons[history_idx]
      var check = rule.lookback[idx];
      var pre_check = rule.lookback[idx - 1]
      if(!item) { 
        // If the current rule is not optional and there are
        // no items left to look back at, then the rule is unsatisfied
        if(!check.optional) {
          valid = false;
        }
      } else {
        var label = item.word.toLowerCase();
        var matching = false;
        var pre_matching = false;
        // If the currently-considered button matches the current check's
        // word list then rule is still satisfied for now
        if(check.words) {
          if(check.words.indexOf(label) != -1) {
            matching = true;
          }
        // Likewise, if the currently-considered button matched
        // the current check's part of speech then the rule is satisfied
        // for now
        } else if(check.type) {
          if((item.types || []).indexOf(check.type) != -1) {
            matching = true;
          }
        }
        // Perform the same checks on the check before the current check
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
          // This is the tricky bit. If the current check also works
          // for the check before the current check, and the current check
          // is option but the one before isn't, then this button
          // should be used to satisfy the check before instead of the 
          // current one. Note there are potentially more edge cases
          // that could be considered, but so far this seems sufficient.
          if(check.optional && pre_matching && !pre_check.optional) {
            matching = false
          }
          // If the current check requires a regex match that the
          // button doesn't match, then this button doesn't satisfy
          if(check.match) {
            if(!label.match(check.match)) {
              matching = false;
            }
          }
          // If the current check requires a regex non-match that the
          // button does match, then this button doesn't satisfy
          if(check.non_match) {
            if(label.match(check.non_match)) {
              matching = false;
            }
          }  
        }
        // If the current button matches, then the rule is
        // satisfactory so far, and checks may continue
        if(matching) {
          // If the current button is used for the current
          // check, and is marked consense, then this index
          // into the prior button list needs to be marked
          // as to-condense if this result is selected
          if(check.condense) {
            condenses.push(history_idx);
          }
          history_idx--;
        // If not matching and the check isn't optional, then
        // the rule cannot be satisfied by the button sequence
        } else if(!check.optional) {
          valid = false;
        }
      }
    }
    // If condense indexes need to be remembered, this
    // information is returned instead of a boolean as 
    // additional information needed in the final result
    if(valid && condenses.length > 0) {
      return {condense_items: condenses};
    }
    return !!valid;
  };

  // lookup is called basically externally, and expects
  // either a word or string of prior words (or both) which
  // can be used to find matching rules and words. The return
  // value is a hash with attributes 'words' and 'rules' defined
  var lookup = function(prior_txt, word_string, locale, do_debug) {
    if(!locale || !word_string) { return {error: 'missing word or locale'}; }
    var settings = locale_sets[locale] || locale_sets[locale.split(/-|_/)[0]];
    if(!settings) { return {error: 'locale ' + locale + ' no loaded' }; }
    // Rule checking is greedy, finding the first matching rule for each type
    var found_types = {};
    var matching_rules = [];
    // Map the prior sentence string to a list of word objects
    var parts = prior_txt.split(/\s+/);
    var prior_buttons = [];
    parts.forEach(function(str) {
      if(str) {
        var wrd = settings.words.find(function(w) { return w.word == str; });
        prior_buttons.push(wrd || {
          word: str
        });  
      }
    });
    var found_words = settings.words.filter(function(w) { return w.word == word_string; });
    settings.rules.forEach(function(rule) {
      if(prior_buttons.length == 0) {
        var matching_replacement = null;
        if(rule.type == 'override') {
          matching_replacement = rule.overrides && rule.overrides[word_string];
        } else if(found_words.find(function(w) { return w.types.indexOf(rule.type) != -1; })) {
          var word = found_words.find(function(w) { return w.types.indexOf(rule.type) != -1; })
          if(rule.inflection && word && word.inflections) {
            // word.types.forEach(function(t) { 
              matching_replacement = matching_replacement || word.inflections[rule.inflection];
            // });
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
              var type_words = settings.words.filter(function(w) { return w.types[0] == key; });
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
  };

  function parseCSV(str) {
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
  };
  function csvToHash(str) {
    var arr = parseCSV(str);
    var head = {};
    for(var idx = 0; idx < arr[0].length; idx++) {
      head[idx] = arr[0][idx];
    }
    var results = {};
    var last = null;
    for(var idx = 1; idx < arr.length; idx++) {
      var row = {};
      var id = null;
      for(var jdx = 0; jdx < arr[idx].length; jdx++) {
        var val = arr[idx][jdx];
        if(jdx == 0) {
          id = arr[idx][jdx];
        } else {
          if(val && val != 'NA' && val != 'N/A') {
            row[head[jdx]] = arr[idx][jdx];
          }
        }
      }
      if(id && Object.keys(row).length > 0) {
        results[id] = row;
        last = row;
      } else if(!id && Object.keys(row).length > 0) {
        last.subrows = last.subrows || [];
        last.subrows.push(row);
      }
    }
    return results;
  };

  in7ns.load = function(locale, opts) {
    opts = opts || {};
    var fallback_locale = locale.split(/-|_/)[0];
    return new Promise(function(resolve, reject) {
      var words_url = opts.words_url || "./words-" + locale + ".json";
      var rules_url = opts.rules_url || "./rules-" + locale + ".json";
      fetch(words_url).then(function(res) { 
        res.json().then(function(json) {
          var words = json;
          var words_list = [];
          for(var key in words) {
            if(!key.match(/^_/)) {
              words[key].word = key;
              words_list.push(words[key]);
            }
          }
          fetch(rules_url).then(function(res) {
            res.json().then(function(json) {
              var rules_list = json.rules;
              rules_list.forEach(function(rule) {
                (rule.lookback || []).forEach(function(lookback) {
                  if(lookback.non_match) { lookback.nms = lookback.non_match; lookback.non_match = new RegExp(lookback.non_match); };
                  if(lookback.match) { lookback.ms = lookback.match; lookback.match = new RegExp(lookback.match); };
                })
              });
        
              locale_sets[locale] = {
                words: words_list,
                rules: rules_list
              };
              if(fallback_locale != locale || !locale_sets[fallback_locale] || locale_sets[fallback_locale].fallback) {
                locale_sets[fallback_locale] = {
                  fallback: true,
                  words: words_list,
                  rules: rules_list
                };
              }
              resolve({
                rules: rules_list,
                words: words_list,
                tests: json.tests
              });
            }, function(err) {
              reject({
                error: err,
                message: "error parsing rules for " + locale,
                words: words_list
              });
            });
          }, function(err) {
            reject({
              error: err,
              message: "error retrieving rules for " + locale,
              words: words_list
            });
          });
        }, function(err) {
          reject({
            error: err,
            message: "error parsing rules for " + locale,
          });
        });
      }, function(err) {
        reject({
          error: err,
          message: "error retrieving words for " + locale
        });
      });
    });
  };
  in7ns.lookup = function(lookup_word, prior_words, locale, do_debug) {
    return lookup(prior_words, lookup_word, locale, do_debug);
  }
  in7ns.parse_words = function(str) {
    var hash = csvToHash(str);
    var new_hash = {};
    for(var key in hash) {
      var word = {inflections: {}};
      for(var opt in hash[key]) {
        if(opt.match(/^type\d/)) {
          word.types = word.types || [];
          word.types.push(hash[key][opt]);
        } else if(opt.match(/^antonym\d/)) {
          word.antonyms = word.antonyms || [];
          word.antonyms.push(hash[key][opt]);
        } else {
          word.inflections[opt] = hash[key][opt];
        }  
      }
      word.inflections.base = word.inflections.base || key;
      new_hash[key] = word;
    }
    return new_hash;
  }
  in7ns.parse_rules = function(str) {
    var hash = csvToHash(str);
    var rules = [];
    for(var key in hash) {
      var rule = {id: key};
      for(var opt in hash[key]) {
        if(opt == 'subrows') {
          hash[key][opt].forEach(function(sub) {
            if(sub.subtype == 'lookback') {
              rule.lookback = rule.lookback || [];
              var lookback = {};
              if(sub.subtype_val2) {
                lookback.type = sub.subtype_val2;
              }
              if(sub.subtype_val1) {
                lookback.words = sub.subtype_val1.split(/\|/);
              }
              if(sub.lookbacks_optional == '1') {
                lookback.optional = true;
              }
              if(sub.lookbacks_match) {
                lookback.match = sub.lookbacks_match;
              }
              if(sub.lookbacks_non_match) {
                lookback.non_match = sub.lookbacks_non_match;
              }
              if(sub.lookbacks_condense == '1') {
                lookback.condense = true;
              }
              rule.lookback.push(lookback);
            } else if(sub.subtype == 'override') {
              rule.overrides = rule.overrides || {}
              rule.overrides[sub.subtype_val1] = sub.subtype_val2;
            }
          });
        } else {
          rule[opt] = hash[key][opt];
        }  
      }
      rules.push(rule);
    }
    return rules;  
  }
})();
