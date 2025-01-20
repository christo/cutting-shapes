import { Link, List, ListItem } from '@mui/material';
import { Puppet } from '../mocap/Puppet.ts';



const About = ({puppets}: {puppets: Puppet[]}) => {
  return (
      <div className="App-body">
        <h1>About Cutting Shapes</h1>
        <div>
          <i>Created by</i> <b>Chris Mountford</b> <i>January 2025</i>
        </div>
        <h2>Acknowledgements</h2>
        <List>
        {puppets.map((puppet, i) => {
          return (<ListItem key={`puppet_ack_${i}`}>
            <Link href={puppet.src}>{puppet.attribution}
            </Link> {puppet.license.longName}
          </ListItem>);
        })}
        </List>
      </div>
  );
};

export default About;
