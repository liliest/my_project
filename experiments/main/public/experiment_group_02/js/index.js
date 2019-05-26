function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
    exp.startT = Date.now();
    }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.attention_check = slide({
    name : "attention_check",
    start: function() {
      $('.attention_questions').hide();
      $(".err").hide();
      

      var aud = document.getElementById("audio_player");
      aud.play();
      
      $("#audio_player").bind("ended", function () {
        console.log("audio ended");
        aud.setAttribute("controls", "controls")
        $('.attention_questions').show();
      });
          
   },
    button : function() {
      var aud = document.getElementById("audio_player");
      aud.pause();

      this.radio = $("input[name='food']:checked").val();
      if (this.radio == "Salad"){
        this.log_responses();
        exp.go()
      }
      else {
        $('.err').show();
        this.log_responses();
      }
    },

    log_responses : function() {
      exp.data_trials.push({
        "slide_number": exp.phase,
        "slide_type": "attention_check",
        "stim" : "attention_audio",
        "audio" : "attention",
        "response" : this.radio,
      });
    }
  });

  slides.one_slider = slide({
    name : "one_slider",
    present: exp.stims, //every element in exp.stims is passed to present_handle one by one as 'stim'
    
    present_handle : function(stim) {
      $(".err").hide();
      $(".trial_questions").hide();

      var aud = document.getElementById("stim");
      aud.removeAttribute("controls");
      aud.src = "audio/"+stim.audio
      aud.load();
      aud.play();


      $("#stim").bind("ended", function () {
        aud.setAttribute("controls", "controls");
        $('.trial_questions').show();
      });
 
          $('input[name="generous"]:checked').removeAttr('checked');
          $('input[name="lazy"]:checked').removeAttr('checked');
          $('input[name="prudish"]:checked').removeAttr('checked');
          $('input[name="effeminate"]:checked').removeAttr('checked');
          $('input[name="aloof"]:checked').removeAttr('checked');
          $('input[name="straight"]:checked').removeAttr('checked');
          $('input[name="neat"]:checked').removeAttr('checked');
          $('input[name="savvy"]:checked').removeAttr('checked');
          $('input[name="kind"]:checked').removeAttr('checked');
          $('input[name="genuine"]:checked').removeAttr('checked');
      
     this.stim = stim;
    },

    button : function() {
      exp.response = {
          masc_not : $('input[name="generous"]:checked').val(),
          fem_not : $('input[name="lazy"]:checked').val(), 
          educ_un : $('input[name="prudish"]:checked').val(),
          form_cas : $('input[name="effeminate"]:checked').val(),
          prent_unp : $('input[name="aloof"]:checked').val(),
          lazy_hw : $('input[name="straight"]:checked').val(),
          smart_stup : $('input[name="neat"]:checked').val(),
          friend_un : $('input[name="savvy"]:checked').val(),
          funny_un : $('input[name="kind"]:checked').val(),
          young_old : $('input[name="genuine"]:checked').val(),
      }

      if ($('input[name="generous"]:checked').val() == undefined |
          $('input[name="lazy"]:checked').val() == undefined |
          $('input[name="prudish"]:checked').val() == undefined |
          $('input[name="effeminate"]:checked').val() == undefined |
          $('input[name="aloof"]:checked').val() == undefined |
          $('input[name="straight"]:checked').val() == undefined |
          $('input[name="neat"]:checked').val() == undefined |
          $('input[name="savvy"]:checked').val() == undefined |
          $('input[name="kind"]:checked').val() == undefined |
          $('input[name="genuine"]:checked').val() == undefined){
          alert("Please fill out every field.");
      }
      else {
        var aud = document.getElementById("audio_player");
        aud.pause();
        aud.removeAttribute("controls");


        this.log_responses();
        _stream.apply(this);

      }
      
    },

    log_responses : function() {
      exp.data_trials.push({
        "slide_number": exp.phase,
        "slide_type": "critical_trial",
        "stim" : this.stim.clip,
        "audio" : this.stim.audio,
        "response" : exp.response,
    });

    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

  exp.condition = "group_two";

  items_group_two = [
    {clip: "X", audio: "X.wav"},
    {clip: "B", audio: "B.wav"},
    {clip: "Y", audio: "Y.wav"},
    {clip: "G", audio: "G.wav"},
  ]

  exp.stims = items_group_two

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };

  //blocks of the experiment:
  exp.structure=["i0", "instructions","attention_check", "one_slider", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
