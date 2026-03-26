<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\helhist_search\Form\HeaderSearchForm;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;

/**
 * Provides a Header Search block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_search_header_search_block',
  admin_label: new TranslatableMarkup('HelHist Header Search'),
  category: new TranslatableMarkup('HelHist'),
)]
class HeaderSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a new HeaderSearchBlock object.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected FormBuilderInterface $formBuilder,
    protected RouteMatchInterface $routeMatch,
    protected SearchPathResolver $searchPathResolver,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {

    // Omit the form from search page.
    $current_node = $this->routeMatch->getParameter('node');
    if (
      ($current_node instanceof NodeInterface) &&
      (int) $current_node->id() === $this->searchPathResolver->getSearchPageNodeId()
      ) {
      return [];
    }
    else {
      return [
        '#theme' => 'header_search',
        '#form' => $this->formBuilder->getForm(HeaderSearchForm::class),
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts(): array {
    return array_merge(parent::getCacheContexts(), ['url.path']);
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags(): array {
    return array_merge(parent::getCacheTags(), ['config:helhist_search.settings']);
  }

}
