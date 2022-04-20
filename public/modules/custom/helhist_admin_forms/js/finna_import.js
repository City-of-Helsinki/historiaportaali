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
              // uuid: '63DcPSsYfssc_2rLO90Cmlk-c4DwPmfe_Aj4iFdxcpM',
              uuid: 'hYnvnamR6ag_AxPcntKd-XexOpwMkaLhAxui6lsUShU',
              element: $('#edit-field-formats'),
              json_wrapper: 'formats',
              json_key: 'translated'
            }
          ];

          $authors_field = [
            {
              // uuid: 'nL39PHzAu3uXzCPe2BBSlw4VVVuZsLVS6RtbkaMLdS8',
              uuid: 'o5vLXb8HgB7zYu_XHLPrCslmmt-Hnd87yCE1cOrRvsE',
              element: $('#edit-field-authors'),
              json_wrapper: 'nonPresenterAuthors',
              json_key: 'name'
            }
          ];

          $copyrights_field = [
            {
              // uuid: 'HSgHktR7ejpMhZd1Y-atx9Axw7SuNtwq0FT_sAh8smU',
              uuid: 'uLeAPTPSYBImqlrCXa80txmYaj1B7rrTbPvmvunHjxE',
              element: $('#edit-field-copyrights'),
              json_wrapper: 'imageRights',
              json_key: 'copyright'
            }
          ];

          $buildings_field = [
            {
              // uuid: '8S0fSi9mz_jgq_PU9xvyDN2ir3lHAnsjmz7_9rnCThY',
              uuid: '9ohEZZrClEf1sGsxVQvK0ye9W9HKlh0k6ZuNhZyRi5o',
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
              $.getJSON('/' + $langcode + '/select2_autocomplete/taxonomy_term/default:taxonomy_term/' + field.uuid + '?term=' + option_data.text + '&_type=query&q=' + option_data.text, function(data) {
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
