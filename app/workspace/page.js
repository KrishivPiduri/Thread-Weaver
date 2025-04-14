// pages/workspace.js (or similar file path)
'use client';

import {useState} from 'react';
import Graph from '../../components/Graph';
import Summary from '../../components/Summary';
import Overlay from '../../components/Overlay';
import '@/app/globals.css';
import 'vis-network/styles/vis-network.css';

const Workspace = () => {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const toggleOverlay = () => {
        setIsOverlayVisible((prev) => !prev);
    };

    // Nodes: Each node is defined with a unique id and a label.
    const nodesData = [
        { id: 1, label: 'American Civil War' },
        { id: 2, label: 'Union' },
        { id: 3, label: 'Confederacy' },
        { id: 4, label: 'Secession' },
        { id: 5, label: 'Abraham Lincoln' },
        { id: 6, label: 'Jefferson Davis' },
        { id: 7, label: 'General Ulysses S. Grant' },
        { id: 8, label: 'General Robert E. Lee' },
        { id: 9, label: 'Battle of Gettysburg' },
        { id: 10, label: 'Battle of Antietam' },
        { id: 11, label: 'First Battle of Bull Run' },
        { id: 12, label: 'Battle of Shiloh' },
        { id: 13, label: 'Emancipation Proclamation' },
        { id: 14, label: '13th Amendment' },
        { id: 15, label: 'Reconstruction' },
        { id: 16, label: 'Fort Sumter' },
        { id: 17, label: 'Confederate States' },
        { id: 18, label: 'Union States' },
        { id: 19, label: 'Slavery' },
        { id: 20, label: 'Underground Railroad' },
        { id: 21, label: 'Abolitionism' },
        { id: 22, label: 'Economic Factors' },
        { id: 23, label: 'Political Factors' },
        { id: 24, label: 'Social Factors' },
        { id: 25, label: 'International Recognition' },
        { id: 26, label: 'Military Strategies' },
        { id: 27, label: 'Ironclad Ships' },
        { id: 28, label: 'Blockade' },
        { id: 29, label: 'Diplomacy' },
        { id: 30, label: "Lincoln's Cabinet" },
        { id: 31, label: 'Southern Economy' },
        { id: 32, label: 'Northern Economy' },
        { id: 33, label: 'Militarization' },
        { id: 34, label: 'Draft' },
        { id: 35, label: 'Volunteer Army' },
        { id: 36, label: 'Homefront' },
        { id: 37, label: 'Propaganda' },
        { id: 38, label: 'Civilian Impact' },
        { id: 39, label: 'Guerrilla Warfare' },
        { id: 40, label: 'African American Troops' },
        { id: 41, label: 'Freedmen' },
        { id: 42, label: 'Rebel Governments' },
        { id: 43, label: 'Civil War Medicine' },
        { id: 44, label: 'Railroads' },
        { id: 45, label: 'Communication (Telegraph)' },
        { id: 46, label: 'Naval Warfare' },
        { id: 47, label: 'Civil War Weapons' },
        { id: 48, label: 'Emancipation Debate' },
        { id: 49, label: 'Morrill Tariff' },
        { id: 50, label: 'Confederate Constitution' },
    ];

// Edges: Each edge shows a relationship between two nodes along with a label.
    const edgesData = [
        { from: 1, to: 2, label: 'Involves' },
        { from: 1, to: 3, label: 'Involves' },
        { from: 1, to: 4, label: 'Catalyzed by' },
        { from: 1, to: 5, label: 'Led by' },
        { from: 1, to: 6, label: 'Led by' },
        { from: 1, to: 7, label: 'Commanded by' },
        { from: 1, to: 8, label: 'Commanded by' },
        { from: 1, to: 9, label: 'Major Battle' },
        { from: 1, to: 10, label: 'Major Battle' },
        { from: 1, to: 11, label: 'Early Battle' },
        { from: 1, to: 12, label: 'Key Battle' },
        { from: 1, to: 13, label: 'Pivotal Document' },
        { from: 1, to: 14, label: 'Legal Milestone' },
        { from: 1, to: 15, label: 'Followed by' },
        { from: 1, to: 16, label: 'Sparked at' },
        { from: 1, to: 19, label: 'Underlying Issue' },
        { from: 3, to: 17, label: 'Comprised of' },
        { from: 2, to: 18, label: 'Comprised of' },
        { from: 19, to: 20, label: 'Opposed by' },
        { from: 19, to: 21, label: 'Opposed by' },
        { from: 22, to: 31, label: 'Impacted' },
        { from: 22, to: 32, label: 'Impacted' },
        { from: 23, to: 1, label: 'Fueled Conflict' },
        { from: 24, to: 1, label: 'Affected by' },
        { from: 5, to: 30, label: 'Advised by' },
        { from: 26, to: 7, label: 'Executed by' },
        { from: 26, to: 8, label: 'Executed by' },
        { from: 27, to: 46, label: 'Revolutionized' },
        { from: 28, to: 2, label: 'Enforced by' },
        { from: 29, to: 25, label: 'Shaped' },
        { from: 33, to: 35, label: 'Driven by' },
        { from: 34, to: 40, label: 'Affected by' },
        { from: 40, to: 41, label: 'Comprised of' },
        { from: 11, to: 37, label: 'Propagandized via' },
        { from: 42, to: 3, label: 'Aligned with' },
        { from: 44, to: 1, label: 'Logistically crucial' },
        { from: 45, to: 1, label: 'Transformed Communication' },
        { from: 47, to: 1, label: 'Advanced Warfare' },
        { from: 48, to: 5, label: 'Influenced by' },
        { from: 49, to: 2, label: 'Backed by' },
        { from: 50, to: 3, label: 'Instituted by' },
        { from: 1, to: 26, label: 'Waged with' },
        { from: 1, to: 27, label: 'Innovated by' },
        { from: 1, to: 29, label: 'Diplomatic challenge' },
        { from: 36, to: 1, label: 'Strained by' },
        { from: 37, to: 1, label: 'Utilized in' },
        { from: 38, to: 1, label: 'Impacted during' },
        { from: 39, to: 1, label: 'Characterized by' },
        { from: 43, to: 1, label: 'Evolved in' },
        { from: 48, to: 19, label: 'Contested over' }
    ];

// Node Summaries: Each summary explains the node in further detail.
    const nodeSummaries = {
        1: "The American Civil War (1861-1865) was a major conflict fought primarily over states' rights and slavery, reshaping the nation.",
        2: "The Union comprised the northern states fighting to preserve the United States and eventually abolish slavery.",
        3: "The Confederacy consisted of the seceded southern states fighting to maintain slavery and asserting states' rights.",
        4: "Secession refers to the act of southern states leaving the Union, which helped spark the Civil War.",
        5: "Abraham Lincoln, the 16th President, led the Union through the war and navigated its complex political challenges.",
        6: "Jefferson Davis served as the President of the Confederate States, leading the southern war effort.",
        7: "General Ulysses S. Grant was a key Union commander whose strategies were pivotal to the Union's victory.",
        8: "General Robert E. Lee led the Confederate Army with notable tactical prowess despite overwhelming odds.",
        9: "The Battle of Gettysburg (July 1863) was a major turning point where Union forces halted the Confederate advance.",
        10: "The Battle of Antietam is known as the bloodiest single-day battle in American history, influencing policy decisions.",
        11: "The First Battle of Bull Run was an early conflict that exposed the unpreparedness of both sides.",
        12: "The Battle of Shiloh showcased the brutal reality of the war and the evolving nature of Civil War combat.",
        13: "The Emancipation Proclamation, issued by Lincoln, declared the freedom of slaves in Confederate territories.",
        14: "The 13th Amendment abolished slavery throughout the United States, marking a definitive legal end to the institution.",
        15: "Reconstruction was the period following the war, focusing on rebuilding the South and integrating freed slaves.",
        16: "Fort Sumter in South Carolina is where the first shots of the Civil War were fired, igniting the conflict.",
        17: "Confederate States refers to the group of southern states that seceded and formed their own government.",
        18: "Union States consisted of the loyal northern states committed to preserving the national union.",
        19: "Slavery was the central social and economic issue that fueled tensions and ultimately led to war.",
        20: "The Underground Railroad was a network that helped enslaved people escape to free states and Canada.",
        21: "Abolitionism was the movement to end slavery, gaining momentum in the decades leading up to the war.",
        22: "Economic Factors, including industrialization and differing agricultural practices, deepened regional divides.",
        23: "Political Factors such as disputes over federal versus state power significantly contributed to the conflict.",
        24: "Social Factors, including differing cultures and values between North and South, played a key role.",
        25: "International Recognition was sought by the Confederacy, though major powers largely sided with the Union.",
        26: "Military Strategies developed and evolved during the war, reflecting both innovation and tactical improvisation.",
        27: "Ironclad Ships transformed naval warfare, marking a shift from wooden vessels to armored designs.",
        28: "The Blockade, enforced by the Union, aimed to strangle the Confederate economy by cutting off supplies.",
        29: "Diplomacy during the war was complex, as both sides sought support and attempted to influence foreign policy.",
        30: "Lincoln's Cabinet was composed of key advisors who helped shape Union strategy and policy.",
        31: "The Southern Economy was heavily reliant on agriculture and slave labor, making it vulnerable to blockade and disruption.",
        32: "The Northern Economy thrived on industry and trade, providing the resources necessary for a sustained war effort.",
        33: "Militarization saw the rapid expansion of armed forces and technological advances in weaponry.",
        34: "The Draft was introduced to meet the enormous manpower requirements, proving controversial and sometimes divisive.",
        35: "Volunteer Army units formed the backbone of early military efforts, reflecting widespread patriotic fervor.",
        36: "The Homefront experienced significant social and economic strain as civilians supported the war effort under hardship.",
        37: "Propaganda was used by both sides to rally support, influence public opinion, and demonize the enemy.",
        38: "Civilian Impact was profound, as ordinary people faced displacement, loss, and the challenges of wartime scarcity.",
        39: "Guerrilla Warfare emerged in some regions, complicating traditional battle lines and extending the conflict.",
        40: "African American Troops were recruited into the Union Army, playing a vital role in changing the tide of the war.",
        41: "Freedmen were formerly enslaved individuals who gained freedom during the conflict and contributed to the war effort.",
        42: "Rebel Governments briefly emerged in parts of the Confederacy, attempting to assert localized control.",
        43: "Civil War Medicine advanced significantly due to the urgent need to treat battlefield injuries under challenging conditions.",
        44: "Railroads were crucial for transporting troops, supplies, and information, and often determined the outcome of campaigns.",
        45: "The telegraph revolutionized communication, enabling rapid dissemination of orders and battlefield reports.",
        46: "Naval Warfare evolved dramatically during the conflict, with innovations that would influence future maritime combat.",
        47: "Advances in Civil War Weapons reflected both technological innovation and the brutal demands of combat.",
        48: "The Emancipation Debate raged over the moral, economic, and political implications of ending slavery.",
        49: "The Morrill Tariff was one of several economic policies that affected trade and industry during the war era.",
        50: "The Confederate Constitution outlined the ideological and political underpinnings of the secessionist government."
    };



    return (
        <div className="relative h-screen w-screen overflow-hidden flex">
            {/* Graph component */}
            <Graph nodesData={nodesData} edgesData={edgesData} />

            {/* Button to open the overlay */}
            <button
                onClick={toggleOverlay}
                className="absolute top-4 left-4 bg-transparent text-gray-500 w-16 h-16 rounded hover:bg-gray-200 flex items-center justify-center text-5xl font-thin"
            >
                {isOverlayVisible ? '‹‹' : '››'}
            </button>

            {/* Overlay */}
            {isOverlayVisible && <Overlay />}

            {/* Summary Section */}
            <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
                <Summary nodesData={nodesData} nodeSummaries={nodeSummaries} />
            </div>
        </div>
    );
};

export default Workspace;
