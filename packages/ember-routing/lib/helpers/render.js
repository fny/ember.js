/**
@module ember
@submodule ember-routing
*/

var get = Ember.get, set = Ember.set;

require('ember-handlebars/helpers/view');

Ember.onLoad('Ember.Handlebars', function(Handlebars) {

  /**
    Renders the named template in the current context using the singleton
    instance of the same-named controller.

    If a view class with the same name exists, uses the view class.

    If a `model` is specified, it becomes the model for that controller.
    
    `render` is also bound. Changing the model will re-render the template
    with the same controller. You can use `render` for complex subtemplates.

    The default target for `{{action}}`s in the rendered template is the
    named controller.

    @method action
    @for Ember.Handlebars.helpers
    @param {String} actionName
    @param {Object?} model
    @param {Hash} options
  */
  Ember.Handlebars.registerHelper('render', function(name, contextString, options) {
    Ember.assert("You must pass a template to render", arguments.length >= 2);
    var container, router, controller, view, context;

    if (arguments.length === 2) {
      options = contextString;
      contextString = undefined;
    }

    if (typeof contextString === 'string') {
      context = Ember.Handlebars.get(options.contexts[1], contextString, options);
    }

    name = name.replace(/\//g, '.');
    container = options.data.keywords.controller.container;
    router = container.lookup('router:main');

    Ember.assert("This view is already rendered", !router || !router._lookupActiveView(name));

    view = container.lookup('view:' + name) || container.lookup('view:default');

    if (controller = options.hash.controller) {
      controller = container.lookup('controller:' + controller);
    } else {
      controller = Ember.controllerFor(container, name, context);
    }

    if (controller && context) {
      controller.set('model', context);
    }

    var root = options.contexts[1];

    if (root) {
      view.registerObserver(root, contextString, function() {
        controller.set('model', Ember.Handlebars.get(root, contextString, options));
      });
    }

    controller.set('target', options.data.keywords.controller);

    options.hash.viewName = Ember.String.camelize(name);
    options.hash.template = container.lookup('template:' + name);
    options.hash.controller = controller;

    if (router) {
      router._connectActiveView(name, view);
    }

    Ember.Handlebars.helpers.view.call(this, view, options);
  });

});
