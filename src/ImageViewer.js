import React, {Component} from 'react';
import Lightbox from 'react-image-lightbox';

export default class LightboxExample extends Component {
  constructor(props) {
    super(props);
    this.state = {isOpen: true};
  }

  render() {
    const {isOpen} = this.state;
    const {imageRecord, imageSrc, onClose} = this.props;

    return (
        <div>
          {isOpen && (
              <Lightbox
                  mainSrc={imageSrc}
                  imageTitle={imageRecord.fullPath}
                  onCloseRequest={() => {
                    this.setState({isOpen: false});
                    onClose();
                  }}
              />
          )}
        </div>
    );
  }
}
