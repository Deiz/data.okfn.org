var Catalog = {
  Models: {},
  Views: {}
};

(function(my, $) {
my.Views.Application = Backbone.View.extend({
  initialize: function () {
    var self = this;
    this.el = $(this.el);
    _.bindAll(this);
    this.router = new Backbone.Router();
    this.router.route('', 'home', function() {
      self.switchView('home');
    });
    this.router.route('about', 'about', function() {
      self.switchView('about');
    });
    this.router.route('dataset/:name', 'dataset', function(id) {
      self.datasetShow(id);
    });

    // initialize various views
    this.searchView = new my.Views.Search({
      model: this.model,
      el: this.el.find('.view.home .placeholder-search')
    });
    this.searchView.render();
  },

  // Helpers
  // -------

  switchView: function(name) {
    this.el.removeClass().addClass('current-view- '+name);
    this.el.find('.view').hide();
    $('.view.' + name).show();
  },

  setTitle: function(title) {
    document.title = title;
    this.el.find('.page-header h1').html(title);
  },

  // Views
  // -------


  datasetShow: function(name) {
    var self = this;
    this.model.getByName(name, function(err, dataset) {
      var view = new my.Views.Dataset({
        model: dataset
      });
      view.render();
      self.el.find('.view.dataset').empty().append(view.el);
      self.setTitle(dataset.get('title'));
      self.switchView('dataset');
    });
  }
});

my.Views.Dataset = Backbone.View.extend({
  template: ' \
    <div class="dataset show"> \
      <div class="row"> \
        <div class="span8"> \
          {{#image}} \
          <img src="{{image}}" alt="{{title}}" class="logo" /> \
          {{/image}} \
          <div class="description">{{description}}</div> \
        </div> \
        <div class="span4"> \
          <div class="actions"> \
            <a href="{{download_url}}" class="btn btn-large"><i class="icon-download-alt"></i>Download</a> \
          </div> \
          <div class="source">Source: {{source}}</div> \
          <ul class="keywords"> \
            {{#keywords}} \
            <li>{{.}} \
            {{/keywords}} \
          </ul> \
        </div> \
      </div> \
    <div> \
  ',

  initialize: function() {
    this.$el = $(this.el);
    _.bindAll(this);
  },

  render: function() {
    var self = this;
    var data = this.model.toJSON();
    data.download_url = data.files[0].url;
    var rendered = Mustache.render(self.template, data);
    this.$el.append(rendered);
    return this;
  }
});

my.Views.DatasetList = Backbone.View.extend({
  templateDataset: ' \
    <div class="dataset summary"> \
      {{#image}} \
      <img src="{{image}}" alt="{{title}}" class="logo" /> \
      {{/image}} \
      <h3><a href="#dataset/{{name}}">{{title}}</a></h3> \
      <div class="description">{{description}}</div> \
      <div class="source">Source: {{source}}</div> \
      <ul class="keywords"> \
        {{#keywords}} \
        <li>{{.}} \
        {{/keywords}} \
      </ul> \
    <div> \
  ',

  initialize: function() {
    this.el = $(this.el);
    _.bindAll(this);
    this.model.bind('all', this.render);
  },

  render: function() {
    var self = this;
    this.el.html('');
    this.model.each(function(dataset) {
      var rendered = Mustache.render(self.templateDataset, dataset.toJSON());
      self.el.append(rendered);
    });
    return this;
  }
});

my.Views.Search = Backbone.View.extend({
  template: ' \
    <div class="search"> \
      <form class="form-horizontal dataset-search" autocomplete="off"> \
        <input type="text" name="q" placeholder="Search datasets" class="search-query js-dataset-query span5" autocomplete="off" /> \
      </form> \
      <div class="row"> \
        <div class="results span8"> \
        </div> \
        <div class="sidebar span4"> \
        </div> \
      </div> \
    </div> \
  ',

  events: {
    'submit .dataset-search': 'onSearchSubmit'
  },

  initialize: function() {
    this.$el = $(this.el);
    // current search results
    this.results = new my.Models.DatasetList();
    this.resultsView = new my.Views.DatasetList({
      model: this.results
    });
  },

  render: function() {
    this.$el.html(this.template);
    this.$el.find('.results').append(this.resultsView.el);

    this.$el.find('.js-dataset-query').typeahead({
      source: _.pluck([], 'title'),
      updater: function(item) {
        return item;
      }
    });
  },

  onSearchSubmit: function(e) {
    var self = this;
    e.preventDefault();
    var q = $(e.target).find('input').val();
    this.model.search(q, function(error, result) {
      self.results.reset(result);
    });
  }
});

my.Models.Catalog = Backbone.Model.extend({
  search: function(q, callback) {
    callback(null, this.get('datasets'));
  },

  getByName: function(name, callback) {
    var out = _.find(this.get('datasets'), function(dataset) {
      return (name === dataset.name)
    });
    var ds = new my.Models.Dataset(out);
    callback(null, ds);
  }
});

my.Models.Dataset = recline.Model.Dataset.extend({
});

my.Models.DatasetList = Backbone.Collection.extend({
  model: my.Models.Dataset
});

}(Catalog, jQuery));

