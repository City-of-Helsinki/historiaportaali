import React from 'react';
import { motion } from 'framer-motion';
import { IconDocument, IconCamera, IconArrowRight } from 'hds-react/icons';
import PlaceholderImage from './PlaceholderImage';

const ResultCard = ({
  type,
  title,
  imageUrl,
  formats,
  phenomena,
  startYear,
  url
}) => {
  const classes = `content-card content-card--${type} content-card--design-search-index`;
  const animations = {
    initial: { opacity: 0.2, y: "-15rem" },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0.2, y: "15rem" },
    transition: {
      duration: 0.15
    }
  }

  return (
    <motion.div layout className="result-wrapper" {...animations}>
      <article className={classes}>
        <a href={url} className="content-card__link" rel="bookmark">
          <div className="content-card__image">
            {imageUrl && (
              <img src={imageUrl} alt="" />
            )}
            {!imageUrl && (
              <PlaceholderImage />
            )}
          </div>
          
          <div className="content-card__content">
            <div className="content-card__metadata">
              <div className="content-card__bundle content-card__metadata-item">
                {type === 'article' && (
                  <>
                    <span className="content-card__metadata-item__icon bundle-article">
                      <IconDocument className="icon" aria-hidden="true" />
                    </span>
                    <span className="content-card__metadata-item__text">{window.Drupal ? window.Drupal.t("Article") : "Article"}</span>
                  </>
                )}
                {type === 'media' && (
                  <>
                    <span className="content-card__metadata-item__icon bundle-image">
                      <IconCamera className="icon" aria-hidden="true" />
                    </span>
                    {formats && (
                      <span className="content-card__metadata-item__text">
                        {formats}
                      </span>
                    )}
                  </>
                )}
              </div>
              {startYear && (
                <div className="content-card__year content-card__metadata-item">
                  <span className="content-card__metadata-item__text">{startYear}</span>
                </div>
              )}
              {phenomena && (
                <div className="content-card__phenomena content-card__metadata-item">
                  <span className="content-card__metadata-item__text">
                    {phenomena}
                  </span>
                </div>
              )}
            </div>
            <h3 className="content-card__title">{title}</h3>
            <span className="content-card__arrow">
              <IconArrowRight className="icon" aria-hidden="true" />
            </span>
          </div>
        </a>
      </article>
    </motion.div>
  );
}

export default ResultCard;
