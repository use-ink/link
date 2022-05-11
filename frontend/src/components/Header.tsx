import { Tab } from '@headlessui/react'
import { useEffect, useState } from 'react'
import logo from "../logo.svg";

interface Props {
    indexFromTabs: (index: number) => void;
}

const Header = ({indexFromTabs}: Props) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        indexFromTabs(selectedIndex);
    }, [indexFromTabs, selectedIndex]);

    return (
        <div className="flex justify-between w-full px-8 py-4">
            <div className='flex items-center w-32'>
                <img src={logo} className="ink-logo" alt="logo" />
            </div>
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="bg-gray-900 p-1 rounded-full">
                    <Tab 
                        className={({ selected }) =>
                        selected ? 'bg-gray-600 text-white hover:bg-gray-600 focus:outline-none' : 'bg-transparent text-gray-500 hover:bg-transparent hover:text-white'
                    }>
                        Shorten
                    </Tab>
                    <Tab 
                        className={({ selected }) =>
                        selected ? 'bg-gray-600 text-white hover:bg-gray-600 focus:outline-none' : 'bg-transparent text-gray-500 hover:bg-transparent hover:text-white'
                    }>
                        Your Links
                    </Tab>
                </Tab.List>
                {/* <Tab.Panels>
                    <Tab.Panel>Content 1</Tab.Panel>
                    <Tab.Panel>Content 2</Tab.Panel>
                </Tab.Panels> */}
            </Tab.Group>
            <div className='flex items-center justify-end w-32'>
                <button>Connect</button>
            </div>  
        </div>
    )
}

export default Header;