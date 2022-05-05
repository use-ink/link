const LinksOverview = () => {
    const urls = JSON.parse(localStorage.urls);

    return (
        <div className="form-panel" style={{ width: "600px"}}>
            <h2 className="text-2xl font-black pb-6">Your Links</h2>
            <div className="flex flex-col space-y-4 w-full">
                {urls &&
                    urls.map(
                        (url:string) => {
                            return (
                                <div 
                                    className="w-full bg-gray-800 px-4 py-3 border-solid border border-gray-700 rounded-md"
                                    key={url}
                                    >
                                        <div>{url}</div>
                                        <div className="text-sm text-gray-500">{url}</div>
                                </div>
                            )
                        }
                    )
                }
            </div>
        </div>
    )
}

export default LinksOverview;