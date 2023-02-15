// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  Drupal.behaviors.finnaImport = {
    attach: function attach() {
      // Create input button
      $('#edit-field-finna-id-wrapper').after('<input id="finna" class="button" value="Finna.fi import"></input>');
      $('#finna').button().click(function() {

        $langcode = $('html').attr('lang');
        $finna_id = $('#edit-field-finna-id-0-value').val();
        $finna_lang = {
           fi: 'fi',
           sv: 'sv',
           en: 'en-gb' 
        };
        // Main loop begins
        $.getJSON('https://api.finna.fi/api/v1/record?id=' + $finna_id + '&prettyPrint=false&lng=' + $finna_lang[$langcode], function(data) {

          $formats_field = [
            {
              url: $.parseJSON($('#edit-field-formats').attr('data-select2-config')).ajax.url.replace("%3A", ":"),
              element: $('#edit-field-formats'),
              json_wrapper: 'formats',
              json_key: 'translated'
            }
          ];

          $authors_field = [
            {
              url: $.parseJSON($('#edit-field-authors').attr('data-select2-config')).ajax.url.replace("%3A", ":"),
              element: $('#edit-field-authors'),
              json_wrapper: 'nonPresenterAuthors',
              json_key: 'name'
            }
          ];

          $copyrights_field = [
            {
              url: $.parseJSON($('#edit-field-copyrights').attr('data-select2-config')).ajax.url.replace("%3A", ":"),
              element: $('#edit-field-copyrights'),
              json_wrapper: 'imageRights',
              json_key: 'copyright'
            }
          ];

          $buildings_field = [
            {
              url: $.parseJSON($('#edit-field-buildings').attr('data-select2-config')).ajax.url.replace("%3A", ":"),
              element: $('#edit-field-buildings'),
              json_wrapper: 'buildings',
              json_key: 'translated'
            }
          ];

          $fields = [$formats_field[0], $authors_field[0], $copyrights_field[0], $buildings_field[0]];

          $.each($fields, (index, field) => {
            var field_data = data['records'][0][field.json_wrapper];

            $(field_data).each((index, element) => {
              var option_data = {
                // Parse "empty" option
                id: '$ID:' + element[field.json_key],
                text: element[field.json_key]
              };
              // Programmatically get Select2 results
              $.getJSON(field.url + '?term=' + option_data.text + '&_type=query&q=' + option_data.text, function(data) {
                if (data['results'].length > 0 && data['results'][0]['text'] === option_data.text) {
                  // Match found, use existing term ID for option
                  option_data.id = data['results'][0]['id'];
                }
                // Append option and select it
                var option = new Option(option_data.text, option_data.id, true, true);
                field.element.append(option).trigger('change');
              });
            });
          });
        // Main loop ends
        });
      });    
    },
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings);
