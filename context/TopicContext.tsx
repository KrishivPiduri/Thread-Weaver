import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
    type Dispatch,
    type SetStateAction,
} from 'react';

type TopicContextType = [string, Dispatch<SetStateAction<string>>];

const TopicContext = createContext<TopicContextType | undefined>(undefined);

interface TopicProviderProps {
    children: ReactNode;
}

export const TopicProvider: React.FC<TopicProviderProps> = ({ children }) => {
    const [topic, setTopic] = useState<string>('');

    return (
        <TopicContext.Provider value={[topic, setTopic]}>
            {children}
        </TopicContext.Provider>
    );
};

export const useTopic = (): TopicContextType => {
    const context = useContext(TopicContext);
    if (!context) {
        throw new Error('useTopic must be used within a TopicProvider');
    }
    return context;
};
