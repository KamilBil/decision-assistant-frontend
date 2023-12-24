import { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const CustomEdge: FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    return (
        <>
            <BaseEdge id={id} path={edgePath} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        padding: 10,
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: 'center',
                    }}
                    className="nodrag nopan"
                >
                    {data.description}
                    <div style={{ height: '20px' }}></div>
                    {data.value === 0 ? '' : data.value}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;
