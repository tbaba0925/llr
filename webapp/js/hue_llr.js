
var seq = function(x)
{
  var ret = new Array();
  if (x > 0)
  {
    for (var i = 0;i < x; ++i)
    {
      ret.push(i);
    }
  }
  else
  {
    for (var i = 0;i > x; --i)
    {
      ret.push(i);
    }
  }
  return ret;
}

var hue_llr = function()
{
  this.__worstColor='#404040';
  this.__sessionID = '';
  this.__baseTime = 0;
  this.__ready = 0.0;
  this.__data = {};
  this.__parentID = '';
  this.__parentSelection = null;
  this.__svgSelection = null;
  this.__dim={width:1200,height:600};
  this.__timeBeatScale = d3.scale.linear();
  this.__beatDisplayScale = d3.scale.linear();
  this.__playerDisplayScale = d3.scale.linear();
  this.__totalBeats = 0;
  this.__currentBeat = 0;
  this.__lastBeatF = 0;
  this.__laneWidth = 0;
  this.__players= [];
  this.__lines = [];
  this.__debugging = false;
  this.__cheating = true;
  this.__playersBeat = [];
  this.die = function(message)
  {
    this.__ready = -1.0;
    console.log(message);
    if (this.__parentSelection != null)
    {
      this.__parentSelection.text(message);
    }
  }
  this.init = function(parent_id,url)
  {
    this.__parentID = parent_id;
    this.__parentSelection = d3.select('#' + this.__parentID);
    if (this.__parentSelection == null)
    {
      this.die('invalid id');
      return;
    }
    this.__svgSelection = this.__parentSelection.append('svg').attr('width',this.__dim.width).attr('height',this.__dim.height);
    d3.json(url, function(err, dat)
    {
      if (err != null)
      {
        this.die('can\'t load data' + err);
        return;
      }
      this.__ready = 0.0;
      this.__data = dat;
      this.__totalBeats = this.__data.meta.beat * this.__data.meta.length;
      this.__timeBeatScale.domain([0,this.__data.meta.duration]).range([0,this.__totalBeats]);
      this.__beatDisplayScale.domain([-this.__data.meta.beat-0.5,0.5]).range([0,this.__dim.height]);
      this.__playerDisplayScale.domain([-1,this.__data.meta.player_cnt]).range([0,this.__dim.width]);
      this.__laneWidth = this.__dim.width / (this.__data.meta.player_cnt+1);
      this.__lastBeatF = -4.0;
      this.__players = seq(+this.__data.meta.player_cnt).map(function(d){return {player_id:d,score:0,color:'#404040'};});
      this.__lines = seq(-this.__data.meta.beat);
      this.__ready = 0.1;
      this.__data.data.forEach(function(d)
      {
        d.beat = +d.beat;
        d.player_id = +d.player_id;
        d.point = 0.0;
        d.removed = false;
        this.__ready += (0.9/(this.__data.data.length+1))
      }.bind(this));
      this.__ready = 1.0;
    }.bind(this));
  };
  this.play = function()
  {
    if (this.__ready === -1.0)
    {
      this.die('can\'t continue');
      return;
    }
    if (this.__ready < 1.0)
    {
//      this.__svgSelection. renew progress bar;
      setTimeout(this.play.bind(this),100);
      return;
    }
    this.__baseTime = Date.now();
    this.__baseTime += this.__timeBeatScale.invert(2*this.__data.meta.beat);
    if (this.__debugging)
    {
      this.__svgSelection.append('text').attr('id','debug_msg').attr('x',10).attr('y',20);
    }
    this.__svgSelection.selectAll('.lane')
      .data(this.__players)
      .enter()
      .append('rect')
        .attr('class','lane')
        .attr('x', function(d){return this.__playerDisplayScale(d.player_id) - this.__laneWidth/2.0;}.bind(this))
        .attr('y',0)
        .attr('width', this.__laneWidth)
        .attr('height', this.__dim.height)
        .attr('fill', function(d){return d.color;})
        .attr('stroke', '#CCCCCC');
    this.__svgSelection.selectAll('.score_bg')
      .data(this.__players)
      .enter()
      .append('rect')
        .attr('class','score_bg')
        .attr('x', function(d){return this.__playerDisplayScale(d.player_id) - this.__laneWidth/2.0;}.bind(this))
        .attr('y',0)
        .attr('width', this.__laneWidth)
        .attr('height', this.__dim.height)
        .attr('opacity', 0.8)
        .attr('fill', '#FFFFFF');
    this.__svgSelection.selectAll('.score')
      .data(this.__players)
      .enter()
      .append('text')
        .attr('class','score')
        .attr('x', function(d){return this.__playerDisplayScale(d.player_id);}.bind(this))
        .attr('y',20)
        .attr('text-anchor', 'middle')
        .text( function(d){return d.score;} )
        .attr('fill', '#FFFFFF')
        .attr('stroke-width', 1.0)
        .attr('stroke', '#000000');
    this.__svgSelection.selectAll('.hline')
      .data(this.__lines)
      .enter()
      .append('line')
        .attr('class','hline')
        .attr('x1', 0)
        .attr('x2', this.__dim.width)
        .attr('y1', function(d){return this.__beatDisplayScale(d);}.bind(this))
        .attr('y2', function(d){return this.__beatDisplayScale(d);}.bind(this))
        .attr('stroke', '#808080')
        .attr('stroke-width', 1);
    this.__svgSelection.append('g').selectAll('.beat')
      .data(this.__data.data)
      .enter()
      .append('circle')
        .attr('class','beat')
        .attr('cx', function(d){return this.__playerDisplayScale(+d.player_id);}.bind(this))
        .attr('cy', function(d){return this.__beatDisplayScale(this.__currentBeat-d.beat);}.bind(this))
        .attr('r', 20)
        .attr('fill', function(d){return d.color;})
        .attr('stroke', '#E0E0E0')
        .attr('stroke-width', 4.0);
    this.play_loop.bind(this)();
    if (this.__cheating)
    {
      this.__data.data.forEach(function(d)
      {
        this.__playersBeat.push({player_id: d.player_id, color: d.color, beat: d.beat+Math.random()*0.8-0.4, evaluated:false});
      }.bind(this));
    }
  };
  this.play_loop = function()
  {
    // step
    var diff = Date.now() - this.__baseTime;
    var currentBeat = this.__timeBeatScale(diff);
    var lastBeat = this.__currenBeat;
    this.__currentBeat = currentBeat;
    var currentBeatI = Math.floor(currentBeat);
    this.__svgSelection.selectAll('.beat')
        .attr('cy', function(d){return this.__beatDisplayScale(this.__currentBeat-d.beat);}.bind(this));
    if (this.__currentBeat != currentBeatI)
    {
      this.__currentBeat = currentBeat;
    }
    this.__svgSelection.selectAll('.score')
      .text(function(d){return d.score;});
    this.__svgSelection.selectAll('.lane')
      .transition(0).duration(100)
      .attr('fill', function(d){return d.color;});
    this.__svgSelection.select('#debug_msg')
      .text(''+diff + '  ' + currentBeatI);
    this.__data.data.filter(function(d)
    {
      return !d.removed && d.beat < this.__currentBeat-0.5;
    }.bind(this)).forEach(function(d){this.eval(d);}.bind(this));
    if (diff < this.__data.meta.duration)
    {
      setTimeout(this.play_loop.bind(this),10);
    }
  };
  this.explode = function(b)
  {
    if (b.removed)
    {
      return;
    }
    b.removed = true;
    this.__players.forEach(function(p)
    {
      if (p.player_id === b.player_id)
      {
        p.score += b.point;
        if (b.point < 0.0)
        {
          p.color = d3.interpolateRgb(this.__worstColor, p.color)(0.9);
        }
        else
        {
          p.color = d3.interpolateRgb(p.color, b.color)(0.4);
        }
      }
    });
    if ( b.point < 0.0 )
    {
      this.__svgSelection.append('text')
        .attr('x', this.__playerDisplayScale(b.player_id))
        .attr('y', this.__beatDisplayScale(0))
        .attr('opacity', 1.0)
        .attr('fill', '#000000')
        .attr('stroke', '#000000')
        .attr('stroke-width',2.0)
        .attr('text-anchor', 'middle')
        .text('BAD')
        .transition(0).duration(500)
          .attr('y', this.__beatDisplayScale(0.5))
          .attr('opacity', 0.0)
          .remove();
      return;
    }
    if ( 100.0 < b.point  )
    {
      this.__svgSelection.append('text')
        .attr('x', this.__playerDisplayScale(b.player_id))
        .attr('y', this.__beatDisplayScale(0))
        .attr('opacity', 1.0)
        .attr('fill', '#C0C0C0')
        .attr('stroke', b.color)
        .attr('stroke-width',2.0)
        .attr('text-anchor', 'middle')
        .text('EXCELLENT!!')
        .transition(0).duration(500)
          .attr('y', this.__beatDisplayScale(-1))
          .attr('opacity', 0.0)
          .remove();
      return;
    }
    if ( 50.0 < b.point )
    {
      this.__svgSelection.append('text')
        .attr('x', this.__playerDisplayScale(b.player_id))
        .attr('y', this.__beatDisplayScale(0))
        .attr('opacity', 0.8)
        .attr('fill', '#000000')
        .attr('stroke', b.color)
        .attr('stroke-width',2.0)
        .attr('text-anchor', 'middle')
        .text('COOL!')
        .transition(0).duration(500)
          .attr('y', this.__beatDisplayScale(-0.8))
          .attr('opacity', 0.0)
          .remove();
      return;
    }
    this.__svgSelection.append('text')
      .attr('x', this.__playerDisplayScale(b.player_id))
      .attr('y', this.__beatDisplayScale(0))
      .attr('opacity', 0.6)
      .attr('fill', b.color)
      .attr('stroke', '#808080')
      .attr('stroke-width',2.0)
      .attr('text-anchor', 'middle')
      .text('GOOD')
      .transition(0).duration(500)
        .attr('y', this.__beatDisplayScale(-0.5))
        .attr('opacity', 0.0)
        .remove();
    return;
  }
  this.eval = function(beat)
  {
    if (beat.removed)
    {
      return;
    }
    var tmp = this.__playersBeat.filter(function(d)
    {
      // 判定
      return !d.evaluated
       && ( d.player_id == beat.player_id )
       && ( Math.abs(beat.beat-d.beat) < 0.3 )
       && ( beat.color == d.color );
    });
    if (tmp.length === 0)
    {
      beat.point = -10.0;
      this.explode(beat);
      return;
    }
    var best = d3.min(tmp.map(function(d){return Math.abs(beat.beat-d.beat);}));
    var besti = 0;
    for (var i=0;i<tmp.length;++i)
    {
      if (Math.abs(beat.beat - tmp[i].beat) === best)
      {
        besti = i;
        break;
      }
    }
    tmp[besti].evaluated = true;
    if (best < 0.1)
    {
      beat.point = 120.0;
      this.explode(beat);
      return;
    }
    if (best < 0.2)
    {
      beat.point = 60.0;
      this.explode(beat);
      return;
    }
    beat.poin = 20.0;
    this.explode(beat);
    return;
  }
  this.beat = function(player, color, time)
  {
//    console.log(player + '  ' + color + '  ' + this.__timeBeatScale(time - this.__baseTime));
//    console.log({player_id:+player,color:color,beat:this.__timeBeatScale(time - this.__baseTime),evaluated:false});
    this.__playersBeat.push({player_id:+player,color:color,beat:this.__timeBeatScale(time - this.__baseTime),evaluated:false});
  };
};


