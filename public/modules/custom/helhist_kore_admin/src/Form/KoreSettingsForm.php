<?php

/**
 * @file
 * Contains \Drupal\helhist_kore_admin\Form\KoreSettingsForm.
 *
 * Provides a form for managing Koulurekisteri content and settings.
 *
 * @category Form
 * @license  https://github.com/City-of-Helsinki/historiaportaali/blob/master/LICENSE MIT License
 * @link     https://historia.hel.fi
 */

namespace Drupal\helhist_kore_admin\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Kore Settings Form
 */
class KoreSettingsForm extends ConfigFormBase {

    /**
     * The language manager.
     *
     * @var \Drupal\Core\Language\LanguageManagerInterface
     */
    protected $languageManager;

    /**
     * Constructs a new KoreSettingsForm.
     *
     * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
     *   The language manager service.
     */
    public function __construct(LanguageManagerInterface $language_manager) {
        $this->languageManager = $language_manager;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static(
            $container->get('language_manager')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'helhist_kore_admin_settings';
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return ['helhist_kore_admin.settings'];
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        $config = $this->config('helhist_kore_admin.settings');
        $current_language = $this->languageManager->getCurrentLanguage()->getId();

        $form['kore_search_title'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Koulurekisteri search page heading'),
            '#default_value' => $config->get('kore_search_title.' . $current_language) ?? '',
            '#weight' => -1,
        ];

        $form['kore_search_text'] = [
            '#type' => 'text_format',
            '#title' => $this->t('Koulurekisteri search page content'),
            '#default_value' => $config->get('kore_search_text.' . $current_language)['value'] ?? '',
            '#format' => 'full_html',
            '#weight' => 0,
        ];

        return parent::buildForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $current_language = $this->languageManager->getCurrentLanguage()->getId();
        $this->config('helhist_kore_admin.settings')
            ->set('kore_search_title.' . $current_language, $form_state->getValue('kore_search_title'))
            ->set('kore_search_text.' . $current_language, $form_state->getValue('kore_search_text'))
            ->save();

        parent::submitForm($form, $form_state);
    }

}
