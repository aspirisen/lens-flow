import * as React from 'react';
import { Lens, StatefulLens } from '../';

export class State extends React.Component {
    public state = {
        name: 'Dropdown one',
        turn: 'turn',
    };

    private lens = new StatefulLens(
        this.state,
        {
            name: {
                opened: false,
                items: ['Dropdown one', 'Dropdown two', 'Dropdown three'],
            },
            turn: {
                index: 0,
            },
        },
        () => this.forceUpdate(),
    );

    public render() {
        const turnLens = this.lens
            .prop('turn')
            .turn(
                (v) => ({ value: `${v.value} ${v.state.index}`, state: v.state }),
                (v) => ({ value: v.value, state: { index: v.state.index + 2 } }),
            );

        return (
            <div>
                <Dropdown lens={this.lens.prop('name')} />
                <Turn lens={turnLens} />
            </div>
        );
    }
}

const Turn = (props: { lens: Lens<any> }) => (
    <div>
        <input value={props.lens.get()} onChange={(e: any) => props.lens.set(e.target.value)} />

        <button onClick={() => props.lens.state.prop('index').set(props.lens.state.get().index + 1)}>
            Increase index in state: {props.lens.state.get().index}
        </button>
    </div>
);

const Dropdown = (props: { lens: Lens<any> }) => {
    const opened = props.lens.state.prop('opened').get();

    return (
        <div>
            <div onClick={() => props.lens.state.prop('opened').set(!opened)}>{props.lens.get()}</div>
            {opened && (
                <div>
                    {props.lens.state.array('items').map(({}, {}, {}, e: any) => (
                        <div key={e} onClick={() => props.lens.set(e)}>
                            {e}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
