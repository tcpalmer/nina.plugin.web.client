import {Modal} from 'rsuite';

const HelpContent = () => {

  return (
      <Modal.Body>
        <p>
          The <b>NINA Web Session History Viewer</b> provides a browser-based view into current and previous NINA imaging sessions.
        </p>

        <p>
          Note that NINA must be running and the Web plugin must be enabled to properly use this app.
        </p>

        <h2>Basic Usage</h2>
        <p>
          Use the Sessions menu to select a session to view. By default, it will show any previous sessions still available on the NINA computer.
          If you're imaging in the current NINA run, a new session will appear in the list a few seconds after the Web plugin is enabled.
          Select any session to open it for viewing.
          <ul>
            <li>A timeline of NINA events will be shown at the top - see below for details.</li>
            <li>Each imaging target associated with the session will appear in a collapsible panel (after the first image is saved).</li>
            <li>The first target associated with the 'live' session will be expanded by default.</li>
            <li>Each target panel will contain a plot of quality metrics for all images for that target - see below.</li>
            <li>Each target panel will also show a table of the images acquired.</li>
            <li>By default, the image table is sorted so that more recent images are shown first. But you can click various columns to
              change the sort column and direction.
            </li>
            <li>If the session is active, new events will appear in the Event Timeline a few seconds after they occur in NINA.</li>
            <li>If the session/target are live, new images will automatically appear in the table (it checks every 10 seconds). Keep the table
              sorted by ID descending to see the most recent at the top.
            </li>
            <li>Clicking a thumbnail in the table opens the image viewer - see below.</li>
          </ul>
        </p>

        <h2>Event Timeline</h2>
        <p>
          The event timeline will show various events that occurred throughout the session: NINA start/stop, sequence start/stop, autofocus, meridian
          flip, mount unpark/park, etc. In addition, each saved image will also be shown, grouped by filter.
        </p>
        <p>
          Controls:
          <ul>
            <li>If you hover over an event marker (or press on touch-enabled devices), additional details will be displayed:</li>
            <ul>
              <li>Images: filter, save time, stars/HFR and a thumbnail</li>
              <li>Autofocus: plot of the AF curve and additional details</li>
              <li>Other: type of event and time of occurrence</li>
            </ul>
            <li>The scroll bar below the plot lets you zoom into time spans of interest: simply slide the left and right travellers to the desired
              locations. Be aware that the scroll will reset to min/max if new data arrives and impacts the plot.
            </li>
          </ul>
        </p>

        <h2>Quality Metrics Plot</h2>
        <p>
          Each target displays a plot of image quality metrics above the table of images. This is very similar to the NINA HFR History plot in
          the NINA Imaging tab where you can select metrics to display on the left and right Y axes.
        </p>
        <p>
          Controls:
          <ul>
            <li>Hover over a data point (or press on touch-enabled devices), to show additional details</li>
            <li>Select the desired metrics from the Left Side and Right Side dropdowns.  Note that if a metric wasn't available or didn't vary for your
              session, it won't be shown.</li>
            <li>If multiple filters were used on the target, you can filter the plot by the imaging filter.</li>
            <li>The scroll bar below the plot behaves the same as the one for the Event Timeline.</li>
          </ul>
        </p>

        <h2>Image Viewer</h2>
        <p>
          If you click a thumbnail image in the table, an image viewer will open with a larger view of the image. Controls to zoom
          and a close button are at the top right. Hitting ESC will also close the viewer.
        </p>
        <p>
          Mouse controls:
          <ul>
            <li>Right mouse click and hold to drag (if zoomed in).</li>
            <li>The mouse thumb wheel will also zoom in and out. The mouse pointer location will be the center of zoom which is quite handy
              for zooming in on an area of interest.
            </li>
            <li>On touch-enabled devices, pinch to zoom in/out works.</li>
          </ul>
        </p>
        <p>
          While the thumbnails are all created at the time the original image was saved and are always available, the full size images
          are calculated on-demand to save disk space using the original file (FITs or XISF). Of course if you have moved or deleted
          the original image, this won't be possible.
        </p>
        <p>
          When a full size image is requested, the original must be converted to a Web-ready format. Several settings control the
          appearance and quality of the generated image and can be changed in the Settings page:
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
        <p>Click the cog in the top right to change settings. The values will be retained (as long as you're using the same browser).
          Note that some settings (e.g. the number of days of sessions to keep) must be set on the plugin options page in NINA.
        </p>

      </Modal.Body>
  );
};

export default HelpContent;
