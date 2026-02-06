<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\helhist_search\Form\HeaderSearchForm;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Header Search block.
 *
 * @Block(
 *   id = "helhist_search_header_search_block",
 *   admin_label = @Translation("HelHist Header Search"),
 *   category = @Translation("HelHist")
 * )
 *
 * @phpstan-consistent-constructor
 */
class HeaderSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The form builder service.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * The route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * The search path resolver service.
   *
   * @var \Drupal\helhist_search\SearchPathResolver
   */
  protected $searchPathResolver;

  /**
   * Constructs a new HeaderSearchBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Form\FormBuilderInterface $form_builder
   *   The form builder service.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   * @param \Drupal\helhist_search\SearchPathResolver $search_path_resolver
   *   The search path resolver service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    FormBuilderInterface $form_builder,
    RouteMatchInterface $route_match,
    SearchPathResolver $search_path_resolver,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->formBuilder = $form_builder;
    $this->routeMatch = $route_match;
    $this->searchPathResolver = $search_path_resolver;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('form_builder'),
      $container->get('current_route_match'),
      $container->get('helhist_search.search_path_resolver')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

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
  public function getCacheContexts() {
    return array_merge(parent::getCacheContexts(), ['url.path']);
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    return array_merge(parent::getCacheTags(), ['config:helhist_search.settings']);
  }

}
