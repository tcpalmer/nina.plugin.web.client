import React from 'react';
import {Modal} from 'rsuite';

const HelpModal = (props) => {

  // TODO: at phone widths, this is too wide

  const {open, handleClose} = props;

  return (
      <div>
        <Modal open={open} onClose={handleClose} className={'help'}>
          <Modal.Header>
            <Modal.Title><h1>Help</h1></Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              The <b>NINA Web Session History Viewer</b> provides a browser-based view into current and previous NINA imaging sessions.
            </p>

            <p>
              Note that NINA must be running and the Web plugin must be enabled to properly use this app.
            </p>

            <h2>Basic Usage</h2>
            <p>
              Use the Session menu to select a session to view. By default, it will show any previous sessions still available on the NINA computer.
              If you're imaging in the current NINA run, a new session will appear in the list a few seconds after the first acquired image has been saved.
              Select this session to begin viewing.
              <ul>
                <li>Each imaging target associated with the session will appear in a collapsible panel.</li>
                <li>The first target associated with the 'live' session will be expanded by default.</li>
                <li>Each target panel will contain a table of the images acquired.</li>
                <li>By default, the image table is sorted so that more recent images are shown first. But you can click various columns to
                  change the sort column and direction.
                </li>
                <li>If the session/target are live, new images will automatically appear in the table (it checks every 10 seconds). Keep the table
                  sorted by ID descending to see the most recent at the top.
                </li>
                <li>Clicking a thumbnail in the table opens the image viewer - see below.</li>
              </ul>
            </p>

            <h2>Image Viewer</h2>
            <p>
              If you click a thumbnail image in the table, an image viewer will open with a larger view of the image. Controls to zoom,
              rotate, and reset are at the bottom and a close button is at the top right. Hitting ESC will also close the viewer.
            </p>
            <p>
              Mouse controls:
              <ul>
                <li>Right mouse click and hold to drag.</li>
                <li>The mouse thumb wheel will zoom in and out. The mouse pointer location will be the center of zoom which is quite handy
                  for zooming in on an area of interest.
                </li>
                <li>Pinch to zoom is not supported.</li>
              </ul>
            </p>
            <p>
              While the thumbnails are all created at the time the original image was saved and are always available, the full size images
              are calculated on-demand to save disk space using the original file (FITs or XISF). Of course if you have moved or deleted
              the original image, this won't be possible.
            </p>
            <p>
              When a full size image is requested, the original must be converted to a Web-ready format. Several settings control the
              appearance and quality of the generated image:
              <ul>
                <li>Image Scale is the scaling factor applied where 1.0 is full-sized. Depending on the resolution of your imaging camera,
                  this can be quite large (10s of MB) and slow to load. Adjust this value for your images and network. The default is 0.75.
                </li>
                <li>Image Quality is a quality parameter to the conversion where 100 is 'best'. Since the images are converted to JPEG which
                  is not a lossless format, even 100 has some degradation. The default is 100.
                </li>
                <li>The NINA options controlling stretching are also available and should behave identically. See the Settings page for details.</li>
              </ul>
              Images converted to the Web-ready format are cached on the NINA computer so if you view the same image again, it will use the
              previously generated version. If you change the settings, it will generate and cache a new version.
            </p>

            <h2>Settings</h2>
            <p>The following settings can be set and will be retained (as long as you're using the same browser).
              <ul>
                <li>SETTING 1</li>
              </ul>
              Note that some settings (e.g. the number of days of sessions to keep) must be set on the plugin options page in NINA.
            </p>

          </Modal.Body>
        </Modal>
      </div>
  );
};

export default HelpModal;
