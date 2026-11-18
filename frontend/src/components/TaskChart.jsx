import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from "recharts";

function TaskChart({ statisticDashboard }) {
    const data = [
        {
            name: "To-do",
            label: "To-do",
            value: statisticDashboard?.todo_tasks ?? 0
        },
        {
            name: "In Progress",
            label: "In Progress",
            value: statisticDashboard?.in_progress_tasks ?? 0
        },
        {
            name: "Done",
            label: "Done",
            value: statisticDashboard?.done_tasks ?? 0
        },
        {
            name: "Overdue",
            label: "Overdue",
            value: statisticDashboard?.overdue_tasks ?? 0
        }
    ]

    const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

    const COLORS = [
        "#F59E0B",
        "#8B5CF6",
        "#22C55E",
        "#EF4444"
    ];

    return (
        <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={150}
                        outerRadius={200}
                        paddingAngle={3}
                    >
                        <Label
                            content={({ viewBox }) => {
                                const { cx, cy } = viewBox;

                                return (
                                    <text
                                        x={cx}
                                        y={cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="black"
                                        fontFamily="Google Sans"
                                    >
                                        <tspan
                                            x={cx}
                                            dy="-10"
                                            fontSize="24"
                                        >
                                            Total Tasks
                                        </tspan>

                                        <tspan
                                            x={cx}
                                            dy="30"
                                            fontSize="40"
                                            fontWeight="bold"
                                        >
                                            {totalTasks}
                                        </tspan>
                                    </text>
                                );
                            }}
                        />
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[index]}
                            />
                        ))}
                    </Pie>

                    <Tooltip />
                    <Legend 
                        verticalAlign="middle"
                        align="right"
                        layout="vertical" 
                        iconSize={30}
                        itemGap={15}
                        wrapperStyle={{
                            fontSize: "25px",
                            fontFamily: "Google Sans",
                            lineHeight: "30px",
                            right: 100
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TaskChart;