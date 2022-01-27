import React from 'react';
import Viewer from 'react-viewer';

const consola = require('consola');

class ImageViewer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    };
  }

  render() {
    const {imageRecord, imageSrc, onClose} = this.props;
    const {visible} = this.state;

    consola.trace('ImageViewer render: ' + imageRecord.fullPath);

    return (
        <div>
          <Viewer
              visible={visible}
              onClose={() => {
                this.setState({visible: false});
                onClose();
              }}

              attribute={true}
              disableMouseZoom={false}
              noNavbar={true}
              noImgDetails={true}
              drag={true}
              showTotal={false}
              zoomSpeed={0.2}
              changeable={false}
              rotatable={true}
              scalable={false}
              defaultScale={1}
              minScale={1}
              zIndex={2010}
              images={[{src: imageSrc, alt: imageRecord.fullPath}]}
          />
        </div>
    );
  }

}

export default ImageViewer;
