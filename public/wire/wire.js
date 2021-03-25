var wire = {};
(function() {
  wire = Object.assign(wire, {
    init: function() {
      wire.pics = {};
      var canvas = document.getElementById('wire');
      canvas.width = 400;
      canvas.height = 400;
      wire.pics.main = {
        canvas: canvas,
        context: canvas.getContext('2d')
      };
      ['ss', 'pcs', 'ara', 'mul', 'taw', 'hc'].forEach(function(key) {
        var canvas = document.getElementById('sample_' + key);
        canvas.width = 400;
        canvas.height = 400;
        wire.pics[key] = {
          canvas: canvas,
          context: canvas.getContext('2d')
        }
        if(key == 'ss') {
          wire.pics[key].wire = true;
          wire.pics[key].head_x = 25;
          wire.pics[key].head_y = 30;
          wire.pics[key].skin = '#e4bc96';
          wire.pics[key].hands = 'oval';
          wire.pics[key].shoulders = false;
        } else if(key == 'pcs') {
          wire.pics[key].skin = '#cf976d';
          wire.pics[key].shirt = '#003e7e';
          wire.pics[key].pants = '#e62324';
          wire.pics[key].shoes = '#808080';
          wire.pics[key].head = 'bottom-heavy';
          wire.pics[key].head_x = 25;
          wire.pics[key].head_y = 35;
          wire.pics[key].arm_thickness = 12;
        } else if(key == 'ara') {
          wire.pics[key].skin = '#f6e6de'
          wire.pics[key].shirt = '#f5a319';
          wire.pics[key].long_sleeves = true;
          wire.pics[key].pants = '#6b9025';
          wire.pics[key].shoes = '#a1532c';
          wire.pics[key].hair = '#a1532c';
        } else if(key == 'mul') {
          wire.pics[key].head_x = 25;
          wire.pics[key].head_y = 30;
          wire.pics[key].neck = false;
          wire.pics[key].skin = '#ffeec8';
          wire.pics[key].shirt = '#a3d9ff';
          wire.pics[key].long_sleeves = true;
          wire.pics[key].pants = '#787878';
          wire.pics[key].shoes = '#ffeec8';
        } else if(key == 'taw') {
          wire.pics[key].tunic = true;
          wire.pics[key].skin = '#c3996b';
          wire.pics[key].shirt = '#fff';
          wire.pics[key].long_sleeves = true;
          wire.pics[key].shoes = '#000';
        } else if(key == 'hc') {
          wire.pics[key].hc = '#f080ac';
          wire.pics[key].hair = true;
        }
      });
      wire.body = {
        head: [200, 80],
        nose: [200, 80],
        chest: [200, 120],
        rshoulder: [220, 130],
        relbow: [235, 160],
        rwrist: [230, 200],
        lshoulder: [180, 130],
        lelbow: [165, 160],
        lwrist: [170, 200],
        waist: [200, 240],
        rknee: [210, 280],
        rheel: [220, 340],
        rtoes: [240, 340],
        lknee: [190, 280],
        lheel: [180, 340],
        ltoes: [160, 340]
      };
    },
    render: function() {
      var context = wire.pics.main.context;
      context.clearRect(0, 0, 400, 400);
      context.arc(wire.body.head[0], wire.body.head[1], 20, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.head[0], wire.body.head[1]);
      context.lineTo(wire.body.chest[0], wire.body.chest[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.chest[0], wire.body.chest[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.chest[0], wire.body.chest[1]);
      context.lineTo(wire.body.rshoulder[0], wire.body.rshoulder[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.rshoulder[0], wire.body.rshoulder[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.rshoulder[0], wire.body.rshoulder[1]);
      context.lineTo(wire.body.relbow[0], wire.body.relbow[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.relbow[0], wire.body.relbow[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.relbow[0], wire.body.relbow[1]);
      context.lineTo(wire.body.rwrist[0], wire.body.rwrist[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.rwrist[0], wire.body.rwrist[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.chest[0], wire.body.chest[1]);
      context.lineTo(wire.body.lshoulder[0], wire.body.lshoulder[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.lshoulder[0], wire.body.lshoulder[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.lshoulder[0], wire.body.lshoulder[1]);
      context.lineTo(wire.body.lelbow[0], wire.body.lelbow[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.lelbow[0], wire.body.lelbow[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.lelbow[0], wire.body.lelbow[1]);
      context.lineTo(wire.body.lwrist[0], wire.body.lwrist[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.lwrist[0], wire.body.lwrist[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.chest[0], wire.body.chest[1]);
      context.lineTo(wire.body.waist[0], wire.body.waist[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.waist[0], wire.body.waist[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.waist[0], wire.body.waist[1]);
      context.lineTo(wire.body.rknee[0], wire.body.rknee[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.rknee[0], wire.body.rknee[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.rknee[0], wire.body.rknee[1]);
      context.lineTo(wire.body.rheel[0], wire.body.rheel[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.rheel[0], wire.body.rheel[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.rheel[0], wire.body.rheel[1]);
      context.lineTo(wire.body.rtoes[0], wire.body.rtoes[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.rtoes[0], wire.body.rtoes[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.waist[0], wire.body.waist[1]);
      context.lineTo(wire.body.lknee[0], wire.body.lknee[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.lknee[0], wire.body.lknee[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.lknee[0], wire.body.lknee[1]);
      context.lineTo(wire.body.lheel[0], wire.body.lheel[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.lheel[0], wire.body.lheel[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.moveTo(wire.body.lheel[0], wire.body.lheel[1]);
      context.lineTo(wire.body.ltoes[0], wire.body.ltoes[1]);
      context.stroke();
      context.beginPath();
      context.arc(wire.body.ltoes[0], wire.body.ltoes[1], 5, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();

      for(var key in wire.pics) {
        if(key != 'main') {
          var pic = wire.pics[key];
          var context = pic.context;
          if(context) {
            context.clearRect(0, 0, 400, 400);
            context.fillStyle = pic.hc || '#eee';
            context.lineWidth = 5;
            context.lineJoin = 'round';
            context.lineCap = 'round';

            if(pic.wire) {
              // neck
              context.beginPath();
              context.moveTo(wire.body.head[0], wire.body.head[1] + (pic.head_y || 30));
              context.lineTo(wire.body.chest[0], wire.body.chest[1]);
              context.stroke();

              // arms
              context.beginPath();
              var rshoulder = pic.shoulders == false ? wire.body.chest : wire.body.rshoulder;
              var lshoulder = pic.shoulders == false ? wire.body.chest : wire.body.lshoulder;
              context.moveTo(wire.body.chest[0], wire.body.chest[1]);
              context.lineTo(rshoulder[0], rshoulder[1]);
              context.lineTo(wire.body.relbow[0], wire.body.relbow[1]);
              context.lineTo(wire.body.rwrist[0], wire.body.rwrist[1]);
              context.stroke();
              context.beginPath();
              context.moveTo(wire.body.chest[0], wire.body.chest[1]);
              context.lineTo(lshoulder[0], lshoulder[1]);
              context.lineTo(wire.body.lelbow[0], wire.body.lelbow[1]);
              context.lineTo(wire.body.lwrist[0], wire.body.lwrist[1]);
              context.stroke();

              // spine
              context.beginPath();
              context.moveTo(wire.body.chest[0], wire.body.chest[1]);
              context.lineTo(wire.body.waist[0], wire.body.waist[1]);
              context.stroke();

              // legs
              context.beginPath();
              context.moveTo(wire.body.waist[0], wire.body.waist[1]);
              context.lineTo(wire.body.rknee[0], wire.body.rknee[1]);
              context.lineTo(wire.body.rheel[0], wire.body.rheel[1]);
              context.lineTo(wire.body.rtoes[0], wire.body.rtoes[1]);
              context.stroke();

              context.beginPath();
              context.moveTo(wire.body.waist[0], wire.body.waist[1]);
              context.lineTo(wire.body.lknee[0], wire.body.lknee[1]);
              context.lineTo(wire.body.lheel[0], wire.body.lheel[1]);
              context.lineTo(wire.body.ltoes[0], wire.body.ltoes[1]);
              context.stroke();
            } else {
              if(pic.neck !== false) {
                // neck
                context.fillStyle = pic.hc || pic.skin || '#eee';
                context.beginPath();
                context.moveTo(wire.body.head[0] - 5, wire.body.head[1] + (pic.head_y || 30));
                context.lineTo(wire.body.chest[0] - 5, wire.body.chest[1]);
                context.lineTo(wire.body.chest[0] + 5, wire.body.chest[1]);
                context.lineTo(wire.body.head[0] + 5, wire.body.head[1] + (pic.head_y || 30));
                context.closePath();
                context.fill();
                context.stroke();
                // context.beginPath();
                // context.moveTo(wire.body.head[0] - 5, wire.body.head[1]);
                // context.lineTo(wire.body.chest[0] - 5, wire.body.chest[1]);
                // context.moveTo(wire.body.chest[0] + 5, wire.body.chest[1]);
                // context.lineTo(wire.body.head[0] + 5, wire.body.head[1]);
                // context.stroke();
              }

              context.fillStyle = pic.hc || pic.skin || '#eee';
              var diff = (pic.arm_thickness || 8) / 2;
              // right arm
              context.beginPath();
              context.moveTo(wire.body.rshoulder[0], wire.body.rshoulder[1]);
              context.lineTo(wire.body.rshoulder[0] + diff, wire.body.rshoulder[1]);
              context.lineTo(wire.body.relbow[0] + diff, wire.body.relbow[1]);
              context.lineTo(wire.body.rwrist[0] + diff, wire.body.rwrist[1]);
              context.ellipse(wire.body.rwrist[0], wire.body.rwrist[1] + 5, 8, 8, 0, 0, 2*Math.PI * 0.7);
              context.lineTo(wire.body.rwrist[0] - diff, wire.body.rwrist[1]);
              context.lineTo(wire.body.relbow[0] - diff, wire.body.relbow[1]);
              context.lineTo(wire.body.rshoulder[0] - diff, wire.body.rshoulder[1]);
              context.fill();
              context.stroke();

              // left arm
              context.beginPath();
              context.moveTo(wire.body.lshoulder[0], wire.body.lshoulder[1]);
              context.lineTo(wire.body.lshoulder[0] + diff, wire.body.lshoulder[1]);
              context.lineTo(wire.body.lelbow[0] + diff, wire.body.lelbow[1]);
              context.lineTo(wire.body.lwrist[0] + diff, wire.body.lwrist[1]);
              context.ellipse(wire.body.lwrist[0], wire.body.lwrist[1] + 5, 8, 8, 0, 0, 2*Math.PI * 0.7);
              context.lineTo(wire.body.lwrist[0] - diff, wire.body.lwrist[1]);
              context.lineTo(wire.body.lelbow[0] - diff, wire.body.lelbow[1]);
              context.lineTo(wire.body.lshoulder[0] - diff, wire.body.lshoulder[1]);
              context.fill();
              context.stroke();

              // shirt
              context.fillStyle = pic.hc || pic.shirt || '#eee';
              context.beginPath();
              context.moveTo(wire.body.chest[0], wire.body.chest[1]);
              context.lineTo(wire.body.rshoulder[0] + 5, wire.body.rshoulder[1] - 5);
              context.lineTo(wire.body.relbow[0] + 10, wire.body.relbow[1]);
              if(pic.long_sleeves) {
                context.lineTo(wire.body.rwrist[0] + 10, wire.body.rwrist[1]);
                context.lineTo(wire.body.rwrist[0] - 10, wire.body.rwrist[1]);
              }
              context.lineTo(wire.body.relbow[0] - 10, wire.body.relbow[1]);
              context.lineTo(wire.body.chest[0] + 20, wire.body.chest[1] + 30);
              context.lineTo(wire.body.waist[0] + 20, wire.body.waist[1]);
              if(pic.tunic) {
                context.lineTo(wire.body.rknee[0] + 10, wire.body.rknee[1]);
                context.lineTo(wire.body.rheel[0] + 10, wire.body.rheel[1] - 10);
                context.lineTo(wire.body.lheel[0] - 10, wire.body.lheel[1] - 10);
                context.lineTo(wire.body.lknee[0] - 10, wire.body.lknee[1]);
              }
              context.lineTo(wire.body.waist[0] - 20, wire.body.waist[1]);
              context.lineTo(wire.body.chest[0] - 20, wire.body.chest[1] + 30);
              context.lineTo(wire.body.lelbow[0] + 10, wire.body.lelbow[1]);
              if(pic.long_sleeves) {
                context.lineTo(wire.body.lwrist[0] + 10, wire.body.lwrist[1]);
                context.lineTo(wire.body.lwrist[0] - 10, wire.body.lwrist[1]);
              }
              context.lineTo(wire.body.lelbow[0] - 10, wire.body.lelbow[1]);
              context.lineTo(wire.body.lshoulder[0] - 5, wire.body.lshoulder[1] - 5);
              context.lineTo(wire.body.chest[0], wire.body.chest[1]);
              context.fill();
              context.stroke();
              
              if(pic.tunic) {
                // collar
                context.beginPath();
                context.moveTo(wire.body.head[0] -10, wire.body.head[1] + (pic.head_y || 30));
                context.lineTo(wire.body.chest[0] - 10, wire.body.chest[1]);
                context.lineTo(wire.body.chest[0] + 10, wire.body.chest[1]);
                context.lineTo(wire.body.head[0] + 10, wire.body.head[1] + (pic.head_y || 30));
                context.closePath();
                context.fill();
                context.stroke();
                context.beginPath();
                context.moveTo(wire.body.head[0], wire.body.head[1] + (pic.head_y || 30));
                context.lineTo(wire.body.chest[0], wire.body.chest[1]);
                context.stroke();

                // cuffs
                context.beginPath();
                context.moveTo(wire.body.lwrist[0] + 12, wire.body.lwrist[1]);
                context.lineTo(wire.body.lwrist[0] - 12, wire.body.lwrist[1]);
                context.lineTo(wire.body.lwrist[0] - 12, wire.body.lwrist[1] - 10);
                context.lineTo(wire.body.lwrist[0] + 12, wire.body.lwrist[1] - 10);
                context.lineTo(wire.body.lwrist[0] + 12, wire.body.lwrist[1]);
                context.fill();
                context.stroke();

                context.beginPath();
                context.moveTo(wire.body.rwrist[0] + 12, wire.body.rwrist[1]);
                context.lineTo(wire.body.rwrist[0] - 12, wire.body.rwrist[1]);
                context.lineTo(wire.body.rwrist[0] - 12, wire.body.rwrist[1] - 10);
                context.lineTo(wire.body.rwrist[0] + 12, wire.body.rwrist[1] - 10);
                context.lineTo(wire.body.rwrist[0] + 12, wire.body.rwrist[1]);
                context.fill();
                context.stroke();
              } else {
                // pants
                context.fillStyle = pic.hc || pic.pants || '#eee';
                context.beginPath();
                context.moveTo(wire.body.waist[0], wire.body.waist[1] - 20);
                context.lineTo(wire.body.waist[0] + 20, wire.body.waist[1] - 20);
                var almost_there = function(start, stop) {
                  var diff_x = stop[0] - start[0];
                  var diff_y = stop[1] - start[1];
                  var hyp = Math.sqrt((diff_x * diff_x) + (diff_y * diff_y));
                  var shrunk = hyp;
                  if(hyp > 20) {
                    shrunk = hyp - 10;
                  } else {
                    shrunk = hyp * 0.9;
                  }
                  var ratio = shrunk / hyp;
                  return [start[0] + diff_x * ratio, start[1] + diff_y * ratio];
                };
                var trace_tangent = function(a, b, target, dist) {
                  var diff_x = b[0] - a[0];
                  var diff_y = b[1] - a[1];
                  var tan_x = -1  * diff_y;
                  var tan_y = diff_x;
                  var hyp = Math.sqrt((tan_x * tan_x) + (tan_y * tan_y));
                  var ratio = dist / hyp;
                  // context.save();
                  // context.fillStyle = '#f00';
                  // context.ellipse(a[0], a[1], 3, 3, 0, 0, 2*Math.PI);
                  // context.fill();
                  // context.ellipse(b[0], b[1], 3, 3, 0, 0, 2*Math.PI);
                  // context.fill();
                  // context.restore();
                  return [target[0] + tan_x * ratio, target[1] + tan_y * ratio];
                };

                var ka = trace_tangent([wire.body.waist[0] + 10, wire.body.waist[1] - 20], wire.body.rknee, wire.body.rknee, -5);
                var kc = trace_tangent([wire.body.waist[0] + 10, wire.body.waist[1] - 20], wire.body.rknee, wire.body.rknee, 5);
                var before_knee = almost_there([wire.body.waist[0] + 10, wire.body.waist[1] - 20], ka);
                var kb = trace_tangent(wire.body.rheel, wire.body.rknee, wire.body.rknee, 5);
                var kd = trace_tangent(wire.body.rheel, wire.body.rknee, wire.body.rknee, -5);
                var after_knee = almost_there(wire.body.rheel, kb);
                var knee_point = wire.body.rknee;
                context.lineTo(before_knee[0] + 10, before_knee[1]);
                context.quadraticCurveTo(knee_point[0] + 15, knee_point[1], after_knee[0] + 10, after_knee[1]);
                context.lineTo(wire.body.rheel[0] + 10, wire.body.rheel[1] - 5);
                context.lineTo(wire.body.rheel[0] - 10, wire.body.rheel[1] - 5);
                var knee_crook = trace_tangent([wire.body.waist[0] + 20, wire.body.waist[1] - 10], before_knee, wire.body.rknee, 10);
                // var knee_crookb = trace_tangent(wire.body.rheel, after_knee, wire.body.rknee, 125);
                var knee_crook = [(kc[0] + kd[0]) / 2, (kc[1] + kd[1]) / 2];
                context.lineTo(knee_crook[0], knee_crook[1]);
                context.lineTo(wire.body.waist[0], wire.body.waist[1] + 20);
                context.lineTo(wire.body.lknee[0] + 5, wire.body.lknee[1]);
                context.lineTo(wire.body.lheel[0] + 10, wire.body.lheel[1] - 5);
                context.lineTo(wire.body.lheel[0] - 10, wire.body.lheel[1] - 5);
                context.lineTo(wire.body.lknee[0] - 15, wire.body.lknee[1]);
                context.lineTo(wire.body.waist[0] - 20, wire.body.waist[1] - 20);
                context.lineTo(wire.body.waist[0], wire.body.waist[1] - 20);
                context.fill();
                context.stroke();
              }

              // right shoe
              context.fillStyle = pic.hc || pic.shoes || '#eee';
              context.beginPath();
              context.moveTo(wire.body.rheel[0] - 10, wire.body.rheel[1] - 5);
              context.lineTo(wire.body.rheel[0] + 10, wire.body.rheel[1] - 5);
              context.quadraticCurveTo(wire.body.rtoes[0] + 20, wire.body.rtoes[1], wire.body.rheel[0] + 10, wire.body.rheel[1] + 10);
              context.lineTo(wire.body.rheel[0] - 10, wire.body.rheel[1] + 10);
              context.lineTo(wire.body.rheel[0] - 10, wire.body.rheel[1] - 5);
              context.fill();
              context.stroke();

              // left shoe
              context.beginPath();
              context.moveTo(wire.body.lheel[0] + 10, wire.body.lheel[1] - 5);
              context.lineTo(wire.body.lheel[0] - 10, wire.body.lheel[1] - 5);
              context.quadraticCurveTo(wire.body.ltoes[0] - 20, wire.body.ltoes[1], wire.body.lheel[0] - 10, wire.body.lheel[1] + 10);
              context.lineTo(wire.body.lheel[0] + 10, wire.body.lheel[1] + 10);
              context.lineTo(wire.body.lheel[0] + 10, wire.body.lheel[1] - 5);
              context.fill();
              context.stroke();
            }

            if(pic.hands  == 'oval') {
              context.fillStyle = '#000';
              // context.beginPath();
              // context.ellipse((wire.body.lheel[0] + wire.body.ltoes[0])/2, (wire.body.lheel[1] + wire.body.ltoes[1])/2, Math.abs(wire.body.lheel[0] - wire.body.ltoes[0])/2, 3, 0, 0, 2 *  Math.PI);
              // context.fill();
              // context.stroke();
  
              // context.beginPath();
              // context.ellipse((wire.body.rheel[0] + wire.body.rtoes[0])/2, (wire.body.rheel[1] + wire.body.rtoes[1])/2, Math.abs(wire.body.rheel[0] - wire.body.rtoes[0])/2, 3, 0, 0, 2 *  Math.PI);
              // context.fill();
              // context.stroke();
  
              context.beginPath();
              context.ellipse(wire.body.lwrist[0], wire.body.lwrist[1], 3, 8, 0, 0, 2 *  Math.PI);
              context.fill();
              context.stroke();
  
              context.beginPath();
              context.ellipse(wire.body.rwrist[0], wire.body.rwrist[1], 3, 8, 0, 0, 2 *  Math.PI);
              context.fill();
              context.stroke();  
            }

            context.fillStyle = pic.hc || pic.skin || '#eee';
            context.beginPath();
            var head_y = pic.neck == false ? wire.body.head[1] + 15 : wire.body.head[1];
            if(pic.head == 'bottom-heavy') {
              context.moveTo(wire.body.head[0] + 5, head_y + pic.head_y);
              context.quadraticCurveTo(wire.body.head[0] + (pic.head_x * 1.3), head_y + pic.head_y, wire.body.head[0] + pic.head_x, head_y);
              context.quadraticCurveTo(wire.body.head[0] + (pic.head_x / 2), head_y - pic.head_y, wire.body.head[0], head_y - pic.head_y);
              context.quadraticCurveTo(wire.body.head[0] - (pic.head_x / 2), head_y - pic.head_y, wire.body.head[0] - pic.head_x, head_y);
              context.quadraticCurveTo(wire.body.head[0] - (pic.head_x * 1.3), head_y + pic.head_y, wire.body.head[0] - 5, head_y + pic.head_y);
              context.fill();
              context.stroke();
            } else {
              context.ellipse(wire.body.head[0], head_y, pic.head_x || 30, pic.head_y || 30, 0, 0, 2 *  Math.PI);
              context.fill();
              context.stroke();
              if(pic.hair) {
                context.fillStyle = pic.hc || pic.hair || '#a1532c';
                context.beginPath();
                context.ellipse(wire.body.head[0], head_y, pic.head_x || 30, pic.head_y || 30, 0, Math.PI, 2 *  Math.PI);
                context.quadraticCurveTo(wire.body.head[0] + (pic.head_x || 30), wire.body.head[1] - (pic.head_y || 30) / 2, wire.body.head[0] + (pic.head_x || 30) / 3, head_y - (pic.head_y || 30) / 3);
                context.quadraticCurveTo(wire.body.head[0], wire.body.head[1], wire.body.head[0] - (pic.head_x || 30), head_y);
                context.fill();
                context.stroke();
              }
            }
            
          }
        }
      }
    }
  });
})();
wire.init();
wire.render();
var canvas = wire.pics.main.canvas;
canvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  console.log("down", e.clientX, e.clientY);
  var bounds = canvas.getBoundingClientRect();
  for(var key in wire.body) {
    if(wire.body[key] && key != 'nose') {
      var x = wire.body[key][0] + bounds.left;
      var y = wire.body[key][1] + bounds.top;
      if(e.clientX > x - 10 && e.clientX < x + 10) {
        if(e.clientY > y - 10 && e.clientY < y + 10) {
          console.log("grab ", key);
          wire.holding = {point: key, start_x: wire.body[key][0], start_y: wire.body[key][1], x: e.clientX, y: e.clientY};
        }
      }
    }
  }
});
document.addEventListener('mouseup', function(e) {
  if(wire.holding) {
    e.preventDefault();
    wire.holding = null;
  }
  wire.render();
});
document.addEventListener('mousemove', function(e) {
  if(wire.holding) {
    e.preventDefault();
    var bounds = canvas.getBoundingClientRect();
    if(wire.body[wire.holding.point]) {
      console.log("holding")
      var diff_x = e.clientX - wire.holding.x;
      var diff_y = e.clientY - wire.holding.y;
      console.log(diff_x, diff_y);
      wire.body[wire.holding.point] = [
        wire.holding.start_x + diff_x,
        wire.holding.start_y + diff_y
      ];
      wire.render();
    }
  }
});