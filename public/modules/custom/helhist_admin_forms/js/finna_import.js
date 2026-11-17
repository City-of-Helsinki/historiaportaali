(($, Drupal, once) => {
  const finnaLanguages = {
    fi: 'fi',
    sv: 'sv',
    en: 'en-gb',
  };

  const fields = [
    { selector: '#edit-field-formats', jsonWrapper: 'formats', jsonKey: 'translated' },
    { selector: '#edit-field-authors', jsonWrapper: 'nonPresenterAuthors', jsonKey: 'name' },
    { selector: '#edit-field-copyrights', jsonWrapper: 'imageRights', jsonKey: 'copyright' },
    { selector: '#edit-field-buildings', jsonWrapper: 'buildings', jsonKey: 'translated' },
  ];

  /**
   * Selects the matching term or a new term option in a Select2 field.
   */
  const addOption = ($element, text) => {
    const url = JSON.parse($element.attr('data-select2-config')).ajax.url.replace('%3A', ':');
    const query = $.param({ term: text, _type: 'query', q: text });

    $.getJSON(`${url}?${query}`, (data) => {
      // Use the existing term when the label matches exactly.
      const match = data.results.find((result) => result.text === text);
      const id = match ? match.id : `$ID:${text}`;
      $element.append(new Option(text, id, true, true)).trigger('change');
    });
  };

  Drupal.behaviors.finnaImport = {
    attach(context) {
      once('finna-import', '#edit-field-finna-id-wrapper', context).forEach((wrapper) => {
        const $button = $('<button type="button" id="finna" class="button">Finna.fi import</button>');
        $(wrapper).after($button);

        $button.on('click', () => {
          const finnaId = $('#edit-field-finna-id-0-value').val();
          const language = finnaLanguages[$('html').attr('lang')] || 'fi';
          const query = $.param({ id: finnaId, prettyPrint: false, lng: language });

          $.getJSON(`https://api.finna.fi/api/v1/record?${query}`, (data) => {
            const record = data.records?.[0];
            if (!record) {
              return;
            }

            fields.forEach((field) => {
              const $element = $(field.selector);
              [record[field.jsonWrapper] ?? []].flat().forEach((item) => {
                addOption($element, item[field.jsonKey]);
              });
            });
          });
        });
      });
    },
  };
})(jQuery, Drupal, once);
