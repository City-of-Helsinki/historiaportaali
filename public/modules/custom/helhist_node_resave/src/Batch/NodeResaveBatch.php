<?php

declare(strict_types=1);

namespace Drupal\helhist_node_resave\Batch;

use Drupal\node\Entity\Node;

/**
 * Node Resave batch.
 *
 *   See https://git.drupalcode.org/project/drupal/blob/8.7.8/core/includes/form.inc#L556-668
 *   for detailed information on batch processing.
 *
 * @package Drupal\helhist_node_resave\Batch
 */
class NodeResaveBatch {

  /**
   * Resave nodes.
   *
   * @param array $chunk
   *   An array of node IDs.
   * @param array $context
   *   A batch context array.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function batchOperation(array $chunk, array &$context) {
    foreach ($chunk as $nid) {
      $node = Node::load($nid);

      if ($node->isPublished()) {
        $node->set('moderation_state', 'published');
      }
      else {
        $node->set('moderation_state', 'draft');
      }

      $created = $node->getCreatedTime();
      $node->setCreatedTime($created);
      $node->save();

      $context['results'][] = $nid;
    }
  }

  /**
   * Handle batch completion.
   *
   * @param bool $success
   *   TRUE if all batch API tasks were completed successfully.
   * @param array $results
   *   An array of resaved node IDs.
   * @param array $operations
   *   A list of the operations that had not been completed.
   */
  public static function batchFinished($success, array $results, array $operations) {
    $messenger = \Drupal::messenger();

    if ($success) {
      $messenger->addMessage(t('Resaved @count nodes.', [
        '@count' => count($results),
      ]));
    }
    else {
      // An error occurred.
      // $operations contains the operations that remained unprocessed.
      $error_operation = reset($operations);
      $message = t('An error occurred while processing %error_operation with arguments: @arguments', [
        '%error_operation' => $error_operation[0],
        '@arguments' => print_r($error_operation[1], TRUE),
      ]);
      $messenger->addError($message);
    }
  }

}
