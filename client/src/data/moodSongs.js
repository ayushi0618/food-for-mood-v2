// Curated Spotify tracks per mood — every ID verified live via Spotify oEmbed.
// Playback uses Spotify's official embed player: 30s previews play directly
// in the browser, no login or redirect needed.

const MOOD_SONGS = {
  happy: [
    { id: '39LLxExYz6ewLAcYrzQQyP', title: 'Levitating', artist: 'Dua Lipa', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02c88bae7846e62a8ba59ee0bd' },
    { id: '5haZbtveqI9v1svcc5IDx6', title: 'Inaam', artist: 'Jasleen Royal ft. Badshah', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02974c87c4d1b73970e0f45f70' },
    { id: '1hA697u7e1jX2XM8sWA6Uy', title: 'Apna Bana Le', artist: 'Sachin-Jigar', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b85b4e8fb6ba961aedfde386' },
    { id: '5bVmOD7UKfP2iLFUGMtdnS', title: 'Mast Magan', artist: 'Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e022d2263486e48ab1b41ae2466' },
    { id: '0biCSADTAblvLTLtJz4pXO', title: 'Nashe Si Chadh Gayi', artist: 'Vishal-Shekhar', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02f5dc36d5000145375a41c3b8' },
    { id: '7AAap8D4C4pTyNoMkM9vjG', title: 'Ishq Di Baajiyaan', artist: 'Shankar-Ehsaan-Loy', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02769fdad411a4492e2f63f76e' },
  ],
  celebrating: [
    { id: '5vTJrmnmJMAvFjrUpUWxyy', title: 'Ashke', artist: 'Karan Aujla', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02804ad79f8482d0ae50f95e7a' },
    { id: '0cbmbkbCIg97a0CTt2c0Y0', title: 'Casa Tupka Anthemo', artist: 'Yo Yo Honey Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02a14d6ecc28bacc51e45e2fa9' },
    { id: '3C0nOe05EIt1390bVABLyN', title: 'On The Floor', artist: 'Jennifer Lopez ft. Pitbull', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d7b2aa3834b82b1cbe899a48' },
    { id: '1QZRCi2Z1DQQaR6bGAzhtN', title: 'Love Dose', artist: 'Yo Yo Honey Singh', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0265ce8c712e4fb894bc88461b' },
    { id: '7m4CgL81VVIHaaiSxyH922', title: 'Desi Kalakaar', artist: 'Yo Yo Honey Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0265ce8c712e4fb894bc88461b' },
    { id: '0RWLe6Dx5cWyPuB1sw6eWf', title: 'LAAVAN', artist: 'Jasmine Sandlas', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0285b1cf1e8e5879a440eecf1f' },
  ],
  sad: [
    { id: '0rk2X5TAhraBC5aCIXK2Rq', title: 'Samjhawan', artist: 'Jawad Ahmad', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028a7ae7092464f6685355dc3c' },
    { id: '5vGiuYFSGekGLgbxhV1rD5', title: 'Tu Jaane Na', artist: 'Atif Aslam', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e021b3ddb624fe039b8e856c15b' },
    { id: '5lKE040hUfDAKOR8HLG92p', title: 'Jeena Jeena', artist: 'Sachin-Jigar ft. Atif Aslam', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02972a8fa058a13f91a1a46850' },
    { id: '3yV2c3cYhkAwSsxAq6nRiv', title: 'Mann Mera', artist: 'Gajendra Verma', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02f628e4136d9d0e2d8dff4fee' },
    { id: '7LfIX3DCzl3AtGJWlCKOKK', title: 'Tum Hi Ho', artist: 'Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e022d2263486e48ab1b41ae2466' },
    { id: '2Fv2injs4qAm8mJBGaxVKU', title: 'Tujhe Kitna Chahne Lage', artist: 'Arijit Singh', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02ba03ff79dad25f7c3542382f' },
  ],
  stressed: [
    { id: '0tgVpDi06FyKpA1z0VMD4v', title: 'Perfect', artist: 'Ed Sheeran', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02ba5db46f4b838ef6027e6f96' },
    { id: '3U4isOIWM3VvDubwSI3y7a', title: 'All of Me', artist: 'John Legend', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02bdcc3b587b5249932bc415c2' },
    { id: '1wnozUBSe7OMpmZiTPJC5j', title: 'Tum Tak', artist: 'A.R. Rahman', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e020c556f210b927ca230f32241' },
    { id: '0loZn1c5heXie7OAtvK6nH', title: 'Humnava Mere', artist: 'Jubin Nautiyal', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02c1cd18ce264a99c525dd88f5' },
    { id: '5OMUXgfXsSukZ0zxelpC3b', title: 'Raanjhanaa', artist: 'A.R. Rahman', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e020c556f210b927ca230f32241' },
    { id: '32765xcLM1fd6wQIpkN9A0', title: 'Hasi', artist: 'Ami Mishra', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02051fe40d22813af67a3391d7' },
  ],
  tired: [
    { id: '5ThyDv6aRVU8AH4vXQNldF', title: 'Finding Her', artist: 'Kushagra', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02292341cd3e621d7f9171331f' },
    { id: '0eCajpR75pDW0r64U6hP2x', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0272a77d038887cdc425f5ee55' },
    { id: '51Ggv32i87ei9RYT0mkcVY', title: 'Safar', artist: 'Bayaan', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02dace28f8bd8585a21fc58088' },
    { id: '75OSVIdR2KPpEmViMt8MX2', title: 'Pal Pal', artist: 'Afusic', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02236d0c72c9c3cbbfa15dd208' },
    { id: '21IYMdzTrzSe191Cy5eMap', title: 'Sailor Song', artist: 'Gigi Perez', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0249c26270052e1671add569c1' },
    { id: '1feANd8EfcDP5UqSvbheM3', title: 'Bekhayali', artist: 'Sachet Tandon', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0290d98409f70719daa0dc0421' },
  ],
  sick: [
    { id: '0loZn1c5heXie7OAtvK6nH', title: 'Humnava Mere', artist: 'Jubin Nautiyal', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02c1cd18ce264a99c525dd88f5' },
    { id: '32765xcLM1fd6wQIpkN9A0', title: 'Hasi', artist: 'Ami Mishra', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02051fe40d22813af67a3391d7' },
    { id: '5VCHlKKMHwlZ7aS3b3HKzW', title: 'Baarish', artist: 'Shashaa Tirupati ft. Ash King', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02bfe420f6adf55990db500a2e' },
    { id: '1tCduDqB3J8r90FAxprLzO', title: 'Nazm Nazm', artist: 'Arko', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02bb101867b5d5f63bf1ae30ba' },
  ],
  angry: [
    { id: '0VjIjW4GlUZAMYd2vXMi3b', title: 'Blinding Lights', artist: 'The Weeknd', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e028863bc11d2aa12b54f5aeb36' },
    { id: '0pqnGHJpmpxLKifKRmU6WP', title: 'Believer', artist: 'Imagine Dragons', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e025675e83f707f1d7271e5cf8a' },
    { id: '1mea3bSkSGXuIRvnydlB5b', title: 'Viva La Vida', artist: 'Coldplay', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02e21cc1db05580b6f2d2a3b6e' },
    { id: '7MXVkk9YMctZqd1Srtv4MB', title: 'Starboy', artist: 'The Weeknd', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e024718e2b124f79258be7bc452' },
    { id: '7so0lgd0zP2Sbgs2d7a1SZ', title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b0860cf0a98e09663c82290c' },
    { id: '1g6nQTE5x7eLJX7tXCTiSz', title: 'Boom Shaka', artist: 'KR$NA', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0213dcb5da9470852eb67f1783' },
  ],
  bored: [
    { id: '6bbJpVAKx6JPAKaMFmaxvC', title: 'Raga of Revenge', artist: 'Anirudh Ravichander', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02b90520d9172e8beeaeb6449b' },
    { id: '1W8MIxJT69pJTJpAbmIBGM', title: 'Hangova', artist: 'Anirudh Ravichander', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b90520d9172e8beeaeb6449b' },
    { id: '7Csa4PStpuYIfUqNMKQ4V8', title: 'Barbaad', artist: 'The Rish', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02148a06ae24e68c088d8d2954' },
    { id: '2wybTm9sMnaT1mI0gO0X2t', title: 'Yeshanagula', artist: 'Anirudh Ravichander', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02f84833b171e52d01cd7936c0' },
  ],
  romantic: [
    { id: '4MU4Kfkd9EnkArK2ocQyqK', title: 'Zaalima', artist: 'Arijit Singh', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02627b5b17cb48f6e6956b842e' },
    { id: '6FjbAnaPRPwiP3sciEYctO', title: 'Raabta', artist: 'Pritam ft. Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02e810a88d506b30bdc0935247' },
    { id: '7eQl3Yqv35ioqUfveKHitE', title: 'Tum Se Hi', artist: 'Pritam ft. Mohit Chauhan', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0252fe6875028c892308ffc2f7' },
    { id: '2FCXQHugkoHE1K3tiDu8pu', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik ft. Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e027569cbe3695608074d9fd389' },
    { id: '1hlbywc8Jhl1FFqJxAMabE', title: 'Ishq', artist: 'Faheem Abdullah', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e020de04fd2c7c3bdc0a1d765f5' },
    { id: '0l6g8Z8mqGbGXFOjigYetD', title: 'Hawayein', artist: 'Pritam ft. Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02faa6cbca4fd36358245390f7' },
  ],
  nostalgic: [
    { id: '7qiZfU4dY1lWllzX7mPBI3', title: 'Shape of You', artist: 'Ed Sheeran', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02ba5db46f4b838ef6027e6f96' },
    { id: '2iNqdCchlUZEgjJbQyZf8T', title: 'Teri Deewani', artist: 'Kailash Kher', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02a853b902decce7830d171841' },
    { id: '2YbKtL9lJBzrjFo4Krld7R', title: 'Aadat', artist: 'Jal', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02e650df38b751417df3602e82' },
    { id: '6sF70gMVf9jg8QEogyVqBl', title: 'Pal Pal Dil Ke Paas', artist: 'Kishore Kumar', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02fbb0937acbbb0ae0ac8c21eb' },
    { id: '3zH1P7gc5petyL0sYCF67K', title: 'Kaho Na Kaho', artist: 'Anu Malik', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02ff6b439f8e29ce783311431b' },
    { id: '1UWacd8x8tPPwmrPB1MoBI', title: 'Ae Dil Hai Mushkil', artist: 'Pritam ft. Arijit Singh', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0258397d59e15b5149adf86033' },
  ],
  hungry: [
    { id: '1rEVydQSe04NJUqyyEyeEq', title: 'Afghan Jalebi', artist: 'Pritam', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e027037561f1e7a2c5ff3cd0a38' },
    { id: '0biCSADTAblvLTLtJz4pXO', title: 'Nashe Si Chadh Gayi', artist: 'Vishal-Shekhar', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02f5dc36d5000145375a41c3b8' },
    { id: '5haZbtveqI9v1svcc5IDx6', title: 'Inaam', artist: 'Jasleen Royal ft. Badshah', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02974c87c4d1b73970e0f45f70' },
  ],
  curious: [
    { id: '5XeFesFbtLpXzIVDNQP22n', title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e024ae1c4c5c45aabe565499163' },
    { id: '3B4etxytImrRKQgV3XHjnR', title: 'Harleys In Hawaii', artist: 'Katy Perry', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e025ebe6cbd74a47a5e8ea88985' },
    { id: '7CyPwkp0oE8Ro9Dd5CUDjW', title: 'One Of The Girls', artist: 'The Weeknd', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b0dd6a5cd1dec96c4119c262' },
  ],
};

export function songsForMood(moodId) {
  return MOOD_SONGS[moodId] && MOOD_SONGS[moodId].length ? MOOD_SONGS[moodId] : MOOD_SONGS.curious;
}

export default MOOD_SONGS;
