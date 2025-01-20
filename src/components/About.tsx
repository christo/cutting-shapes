import { Puppet } from '../mocap/Puppet.ts';



const About = ({puppets}: {puppets: Puppet[]}) => {
  return (
      <div className="App-body">
        <h1>About Cutting Shapes</h1>
        <div>
          <i>Created by</i> <b>Chris Mountford</b> <i>January 2025</i>
        </div>
        <h2>Acknowledgements</h2>
        {puppets.map((puppet, i) => {
          return (<div key={`puppet_ack_${i}`}>
            <a href={puppet.src}>{puppet.attribution}
            </a> {puppet.license}</div>);
        })}
      </div>
  );
};

export default About;
