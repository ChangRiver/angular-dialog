angular.module('ngModal', [])
	.provider('ngModalService', function() {
		var defaults = this.defaults = {
			templateUrl: '',
			template: '<div></div>',
			resolve: {},
			controller: '',
			scope: '',
			showCloseButton: true,
			closeOnOverlayClick: true,
			overlay: true,
			openingClass: '',
			closingClass: '',
			openingOverlayClass: '',
			closingOverlayClass: '',
			bodyClass: ''
		}


		/*********
		*
		*   set the defaults methods
		*
		***/

		this.setDefaults = function(options) {
			angular.extend(this.defaults, options);
		}


		this.$get = ['$controller', '$timeout', '$rootScope', '$injector', '$compile', '$http', '$templateCache', '$window', '$document', '$q', 
		function($controller, $timeout, $rootScope, $injector, $compile, $http, $templateCache, $window, $document, $q) {
			var modalCounter = 0,
				incrementalId = 0,
				isClosing = false,
				style = (document.body || document.documentElement).style;
				$body = angular.element(document).find('body');
				$html = angular.element(document).find('html');


			/*************
			*
			*   the private methods
			*
			****/

			function getTemplate(options) {
				var deferred = $q.defer();
				if(options.templateUrl) {
					$http.get(options.templateUrl, {
						cache: $templateCache
					}).then(function(result) {
						deferred.resolve(result.data);
					});
				}else {
					deferred.resolve(options.template);
				}

				return deferred.promise;
			}

			function getResolvePromise(resolves) {
				var promisesArr = [];
				angular.forEach(resolves, function(value) {
					promisesArr.push($q.when($injector.invoke(value))); //////////// question???
				});

				return promisesArr;
			}

			function closeModal(modal) {
				var $modal = angular.element(modal);
				var options = $modal.data('options');
				isClosing = true;
				$modal.unbind('click');

				if(modalCounter === 1) {
					$document.unbind('keydown');
				}

				modalCounter -= 1;

				cleanUp($modal)
			}

			function cleanUp($modal) {
				var elementId = $modal.attr('id');
				$modal.scope().$destroy();
				$modal.remove();
				isClosing = false;
				if(modalCounter === 0) {
					$body.removeClass('modal-open');
					$html.css('margin-right', '');
				}

			}


			/***************************************
			*
			*   the  Public API
			*
			****/

			function open(opts) {

				function closeByAction(event) {
					var overlay = angular.element(event.target).hasClass('fancymodal-overlay');
					var closeBtn = angular.element(event.target).hasClass('fancymodal-close');

					if(overlay && options.closeOnOverlayClick || closeBtn) {
						close(modal.attr('id'));
					}
				}

				function execOpen($modal) {
					var deferred = $q.defer();
					var htmlTemplate;
					getTemplate(options).then(function(template) {
						htmlTemplate = template;
						return $q.all(getResolvePromise(options.resolve));
					}).then(function(locals) {
						if(!isClosing) {
							var data = {};
							var resolveCounter = 0;
							var ctrl;
							angular.forEach(options.resolve, function(value, key) {
								data[key] = locals[resolveCounter];
								resolveCounter += 1;
							});
							scope.$modal = $modal;
							data.$scope = scope;
							if(options.controller) {
								ctrl = $controller(options.controller, data);
							}
							contentData.append($compile(htmlTemplate)(scope));
							deferred.resolve();
						}else {
							deferred.reject();
						}
					});
					return deferred.promise;
				}

 				opts = opts || {};
 			    var options = angular.copy(defaults);
 			    angular.extend(options, opts)
 			    modalCounter += 1;
 			    incrementalId += 1;
 			    $body.addClass(options.bodyClass);

 			    var scope = (options.scope || $rootScope).$new();
 			    var modal = angular.element('<div id="fancymodal-'+ incrementalId +'" class="fancymodal"></div>').addClass(options.themeClass);
 			    modal.data('options', options);
 			    var content = angular.element('<div>').addClass('fancymodal-content');

 			    if(options.showCloseButton) {
 			    	var closeButton = angular.element('<div>').addClass('fancymodal-close');
 			    	content.append(closeButton);
 			    }

 			    var contentData = angular.element('<div>').addClass('fancymodal-data');

 			    if(options.overlay) {
 			    	var overlay = angular.element('<div>').addClass('fancymodal-overlay').addClass('openingOverlayClass');
 			    	modal.append(overlay) {}
 			    }

 			    content.append(contentData);
 			    content.addClass(options.openingClass);

 			    modal.bind('click', closeByAction);
 			    modal.append(content);
 			    $body.append($compile(modal)(scope));
 			    var id = 'fancymodal-' + incrementalId;
 			    var $modal = {
 			    	id: id,
 			    	close: function() {
 			    		return close(id);
 			    	}
 			    };

 			    //open the dialog
 			    var openPromise = execOpen($modal);

 			    return angular.extend({
 			    	opened: openPromise
 			    }, $modal);
 				
			}


			function close(id) {
				var modal = document.getElementById(id);
				if(modal) {
					closeModal(modal);
				}
			}

			return {
				open: function(options) {
					return open(options);
				},
				close: function(id) {
					return close(id);
				},
				getDefaults: function() {
					return angular.copy(defaults);
				}
			}
		}];
});
