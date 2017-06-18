(function() {
  'use strict';

  angular.module('app.model').controller('MainController', MainController);

  MainController.$inject = [ 'modelService', 'themeService', 'storageService',
              '$uibModal', '$document', '$crypto', '$http', '$scope', '$location',
              '$timeout', 'hotkeys', 'uuid4', 'Papa', 'FileSaver', 'Blob'
            ];

  var DEFAULT_KEY = '';
  var ALPHABETS = 'abcdefghijklmnopqrstuvwxyz';

  function MainController(modelService, themeService, storageService, uibModal,
          document, crypto, http, scope, location, timeout, hotkeys, uuid4, Papa, FileSaver) {
    this._modelService = modelService;
    this._themeService = themeService;
    this._storageService = storageService;
    this._modal = uibModal;
    this._document = document;
    this._crypto = crypto;
    this._http = http;
    this._scope = scope;
    this._location = location;
    this._timeout = timeout;
    this._hotkeys = hotkeys;
    this._uuid4 = uuid4;
    this._papa = Papa;
    this._fileSaver = FileSaver;

    this._initHeader();
    // _initBody called with ng-init in each page
    //this._initBody();
  }

  MainController.prototype._initHeader = function() {

    this.navbar = {
      templateUrl : 'app/ui/html/navbar.html',
      pages: [
        {
          "name" : "UI", "path" : "/", "ra" : false
        }, {
          "name" : "Home", "path" : "/home", "ra" : false
        }, {
          "name" : "Blog", "path" : "/blog", "ra" : false
        }
      ]
    };

    //this.themes = this._themeService.themes();
    this.themes = [ "default", "cerulean", "cosmo", "cyborg", "darkly", "flatly",
              "journal", "lumen", "paper", "readable", "sandstone", "simplex",
              "slate", "solar", "spacelab", "superhero", "united", "yeti" ]; // zero-index
    this._themeService._themes = this.themes;
    this.store('theme', this._themeService.pick(8));

    // FIXME: this.aboutOpts.config --> get.paths did not start with relative path
    this.aboutOpts = {
      templateUrl : 'app/ui/html/about.html',
      config : function() {
        return {
          'get' : {
            'paths' : [ 'trendui/app/ui/json/about.json' ],
            'key' : 'init'
          }
        };
      }
    };

    // You can pass it an object.  This hotkey will not be unbound unless manually removed
    // using the hotkeys.del() method
    this._hotkeys.add({
      combo: 'ctrl+v',
      description: 'Paste from clipboard',
      callback: function() {
        console.log('ctrl+v');
      }
    });
  };

  MainController.prototype._initBody = function() {
    if (this._location.path() === '/') {
      /* Anything that needs to be executed in home page goes here... */
    }

    if (this._location.path() === '/blog') {
      /* Anything that needs to be executed in path /blog goes here... */
    }
  };

  MainController.prototype.generate = function() {
    var ctrl = this;

    var g = '';
    for (var i in ctrl.contents) {
      var c = ctrl.contents[i];
      var ln = ctrl.linePrefix;
      var j = 0;
      for (var k in c) {
        var v = c[k];
        if (j>0) ln += ', ';
        ln += "'" + v + "'";
        j++;
      }
      ln += ctrl.linePostfix;
      if (i>0) g += '\n';
      g += ln;
    }
    ctrl.generated = g;



    var data = new Blob([ctrl.generated], {type: 'text/plain;charset=utf-8'});
    ctrl._fileSaver.saveAs(data, nameFile());

    function nameFile() {
      var name = '';
      if (ctrl.destVersion) name += ctrl.destVersion + '_';
      if (ctrl.hasTimestamp) name += currentTimestamp() + '__';
      if (ctrl.destName) name += ctrl.destName;
      if (ctrl.destType) name += '.' + ctrl.destType;
      if (name === '') name = currentTimestamp() + '.txt';
      return name;
    }

    function currentTimestamp() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hh = today.getHours();
        var MM = today.getMinutes();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        if (hh < 10) hh = '0' + hh;
        if (MM < 10) MM = '0' + MM;
        var timestamp = yyyy + '.' + mm + '.' + dd + '.' + hh + '.' + MM;
        return timestamp;
    }
  };

  MainController.prototype.uploadCsv = function() {
    var ctrl = this;
    var input = $('#uploaded');

    input.change(function (results) {
      //console.log(results);
      parseCSV(results.target.files[0]);
      input.val('');
    });

    function parseCSV(file) {
      console.log(file.name);

      ctrl.processing = true;
      ctrl.uploaded = false;
      ctrl.fileName = file.name;

      var results = ctrl._papa.parse(file, {
        header: true
      }).then(function (results) {
        ctrl.contents = results.data;

        if (ctrl.contents && ctrl.contents.length > 0) {
          // get the keys
          ctrl.keys = [];
          for (var p in ctrl.contents[0]) {
            ctrl.keys.push(p);
          }
        }
        ctrl.uploaded = true;
      }).catch(function(results) {
        alert(result);
      }).finally(function() {
        ctrl.processing = false;
      });
    }

    input.trigger('click');
  };

  /* */

  MainController.prototype.generateUuid = function() {
    this.uuid = this._uuid4.generate();
  };

  MainController.prototype.save = function(str) {
    if (typeof str === 'string' && str.trim().length > 0) {
      str = str.trim();
      var exist = false;
      for ( var i in this.saved) {
        var entry = this.saved[i];
        if (entry === str) {
          exist = true;
          break;
        }
      }
      if (exist === false) {
        this.saved.push(str);
        this.set('saved', this.saved);
      }
    }
  };

  MainController.prototype.remove = function(str) {
    if (typeof str === 'number') {
      this.saved.splice(str, 1);
      if (this.saved.length <= 0) {
        this.saved = DEFAULT_LIST;
      }
      this.set('saved', this.saved);
    } else if (typeof str === 'string') {
      var exist = false;
      for ( var i in this.saved) {
        var entry = this.saved[i];
        if (entry === str) {
          this.saved.splice(i, 1);
          exist = true;
          break;
        }
      }
      if (exist === true) {
        if (this.saved.length <= 0) {
          this.saved = _.map(DEFAULT_LIST, _.clone);
        }
        this.set('saved', this.saved);
      }
    }
  };

  MainController.prototype.set = function(key, val) {
    this._modelService.set(this, key, val);
  };

  MainController.prototype.store = function(key, val) {
    var storeKey = 'data_' + key;
    this._modelService.watch(this, [ key ], 'store' + key, (function() {
      this._storageService.saveObject(this[key], storeKey);
    }).bind(this));
    var stored = this._storageService.loadObject(storeKey);
    if (typeof stored !== 'undefined' && stored !== null) {
      if (typeof stored.length !== 'undefined' && stored.length > 0) {
        this[key] = stored;
      } else if (typeof stored === 'boolean') {
        this[key] = stored;
      }
    }
    if (typeof this[key] === 'undefined') {
      this[key] = val;
    }
  };

  MainController.prototype.openModal = function() {
    this.modal({
      templateUrl: 'app/ui/html/modal.html'
    });
  };

  MainController.prototype.modal = function(args) {
    if (typeof args === 'undefined') {
      args = {};
    }
    if (typeof args === 'object') {
      args.animation = args.animation ? args.animation : true;
      args.size = args.size ? args.size : 'md';
      args.config = args.config ? args.config : null;
    }
    var self = this;
    var modalInstance = this._modal.open({
      animation : args.animation,
      templateUrl : args.templateUrl,
      controller : 'ModalController as ctrl',
      size : args.size,
      resolve : {
        parentCtrl : function() {
          return self;
        },
        config : args.config
      }
    });

    // TODO: this feature to be updated in the future
    modalInstance.result.then(function() {
    }, function() {
    });
  };

  MainController.prototype.links = function(str, links) {
    if (typeof str === 'undefined' || typeof links === 'undefined') {
      return str;
    }
    var template = '<a href="{url}" target="_blank">{label}</a>';
    for ( var i in links) {
      var link = links[i];
      var a = template.replace('{url}', link.url).replace('{label}', link.name);
      str = str.replace(link.name, a);
    }
    return str;
  };

})();
